import axios from 'axios'
import type { ApiResponse } from '@/interfaces/api'
import type { OnChunk, OnCompleted, OnError } from '@/interfaces/callback'
import { useUserStore } from '@/stores/userStore'
import router from '@/router'
import { getNewToken } from '@/api/refreshToken'

const baseURL = import.meta.env.VITE_API_BASEURL

// 刷新token相关状态
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []  //存回调函数的数组

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb)  //发现有别的请求刷新token，就把自己放在队列里，等待新accessToken回来继续请求接口
}

const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.forEach(cb => cb(newToken))  //刷新成功后，用新accessToken通知每一个回调函数
    refreshSubscribers = []  //清空队列
}

//创建axios实例
export const server = axios.create({
    baseURL: baseURL,
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json'
    }
})

//封装请求拦截器
server.interceptors.request.use(
    config => {
        //装token等等的公共操作
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers.Authorization = 'Bearer ' + accessToken
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

//封装响应拦截器
server.interceptors.response.use(
    async res => {
        //200是成功
        if (res && (res.data.status === 200 || res.data.status === 409)) {
            return res
        }
        //401是accessToken有误，需要重新登陆
        //403是refreshToken有误或者token版本不一致，需要重新登陆
        if (res && (res.data.status === 401 || res.data.status === 403)) {
            //跳转个人中心页登录
            router.push({ name: 'profile', query: { msg: res.data.msg } }).catch(err => {
                console.log('跳转失败:', err)
            })
            //清空用户信息
            const userStore = useUserStore()
            userStore.clearUserInfo()

            return Promise.reject(res.data.msg)
        }
        //402是accessToken过期，需要刷新
        if (res && res.data.status === 402) {
            const originalRequest = res.config //原始请求，防止后面重新请求时丢失
            if (!isRefreshing) {
                isRefreshing = true
                try {
                    //刷新token
                    const { accessToken, refreshToken } = await getNewToken()
                    const newAccessToken = accessToken.split(' ')[1]
                    const newRefreshToken = refreshToken.split(' ')[1]

                    //更新token
                    const userStore = useUserStore()
                    userStore.updateToken(newAccessToken, newRefreshToken)

                    //通知排队的请求用新token重试
                    isRefreshing = false
                    onTokenRefreshed(newAccessToken)

                    //刷新成功后，重新发送原请求
                    return server(originalRequest)
                } catch (err: unknown) {
                    isRefreshing = false
                    refreshSubscribers = []  //刷新失败，后面也不提醒了，直接清空队列，退出登录
                    //刷新失败，清空用户信息并跳转登录
                    const userStore = useUserStore()
                    userStore.clearUserInfo()
                    router.push({
                        name: 'profile',
                        query: { msg: err as string || '登录已过期，请重新登录' }
                    }
                    ).catch(() => {
                        console.log('跳转失败:', err)
                    })
                    return Promise.reject(err instanceof Error ? err.message : '登录已过期，请重新登录')
                }
            } else {
                // 正在刷新中，其他请求先排队
                return new Promise(resolve => {
                    subscribeTokenRefresh(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token
                        resolve(server(originalRequest))
                    })
                })
            }
        }

        return Promise.reject(res.data.msg)
    },
    error => {
        console.log("响应错误", error)
        return Promise.reject(error)
    }
)

//普通接口
//封装post
export const post = async<T, R>(url: string, data?: T, signal?: AbortSignal) => {   //T是请求体data的类型，R是响应体data的类型
    const res = await server.post<ApiResponse<R>>(url, data, signal ? { signal } : undefined)
    return res.data
}
//封装get
export const get = async<T, R>(url: string, params?: T) => {
    const res = await server.get<ApiResponse<R>>(url, { params })
    return res.data
}
//封装delete
export const remove = async<T, R>(url: string, data?: T) => {
    const res = await server.delete<ApiResponse<R>>(url, { data })
    return res.data
}
//封装put
export const put = async<T, R>(url: string, data?: T) => {
    const res = await server.put<ApiResponse<R>>(url, data)
    return res.data
}




//流式接口，要用fetch
export const streamPost = async (url: string,
    message: Record<string, unknown>,
    onChunk: OnChunk,
    onCompleted: OnCompleted,
    onError: OnError,
    retryCount = 0,   //防止无限重试（刷新token)
    signal?: AbortSignal) => {
    try {
        const userStore = useUserStore()
        if (!userStore.isLogin) { throw new Error('请先登录') }
        const res = await fetch(`${baseURL}/travel${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userStore.accessToken
            },
            body: JSON.stringify(message),
            signal,  // 直接使用外部传入的 signal，外部 abort 时立即中断
        })
        //判断token是否合法/过期/是否需要刷新
        const contentType = res.headers.get('Content-Type')
        if (contentType?.includes('application/json')) {
            //如果是json证明token认证失败
            const data = await res.json() //拿到后端返回的原始数据
            if (data && (data.status === 401 || data.status === 403)) {
                //token认证失败，直接清除用户信息然后跳转个人页面
                const userStore = useUserStore()
                userStore.clearUserInfo()
                router.push({
                    name: 'profile',
                    query: {
                        msg: data.msg
                    }
                }).catch(() => {
                    console.log('跳转失败:', data.msg)
                })
                return
                //返回后，后续的代码就不会执行了
            }
            if (data && data.status === 402) {
                // accessToken过期，刷新token
                if (retryCount >= 1) {
                    // 已经重试过一次还是402，说明refreshToken也过期了
                    const userStore = useUserStore()
                    userStore.clearUserInfo()
                    router.push({ name: 'profile', query: { msg: data.msg } }).catch(() => {
                        console.log('跳转失败:', data.msg)
                    })
                    return
                }
                try {
                    const { accessToken, refreshToken } = await getNewToken()
                    const newAccessToken = accessToken.split(' ')[1]
                    const newRefreshToken = refreshToken.split(' ')[1]
                    const userStore = useUserStore()
                    userStore.updateToken(newAccessToken, newRefreshToken)
                    // 刷新成功后重新发起流式请求
                    streamPost(url, message, onChunk, onCompleted, onError, retryCount + 1, signal)
                    return
                } catch (err) {
                    const userStore = useUserStore()
                    userStore.clearUserInfo()
                    router.push({ name: 'profile', query: { msg: '登录已过期，请重新登录' } }).catch(() => { })
                    return
                }
            }
        }
        if (!res.body) throw new Error('响应体流式数据为空');
        //获取响应体的可读流的读取器
        const reader = res.body.getReader()
        //把流数据（二进制）转成字符串结构
        const decoder = new TextDecoder()
        //一直读取流数据，里面解构后包含done和value
        //done:是否读取完成
        //value:读取到的数据
        while (true) {
            const { done, value } = await reader.read()
            //直到done为true，就是读取完毕
            if (done) break;  //done为true后，就没有value了，无法解码，所以需要先判断
            //解码value成字符串
            const chunk = decoder.decode(value, { stream: true })
            //处理chunk
            const lines = chunk.split('\n').filter((line: string) => line.trim())
            lines.forEach((line: string) => {
                if (line.startsWith("data:{")) {
                    //'data:{"type":"chunk","content":"比如"}'
                    //截取前面的'data:
                    try {
                        const str: { type?: string, content?: string, data?: string, msg?: string, done?: boolean } = JSON.parse(line.slice(5))
                        // console.log(str)
                        if (str.type === 'chunk') {
                            onChunk(str.content as string)
                        } else if (str.type === 'error') {
                            onError(str.msg || '未知错误')
                        } else if (str.done) {
                            onCompleted()
                        }
                    } catch (err: unknown) {
                        console.log("流式解析错误", err)
                        if (err instanceof Error) {
                            onError(err.message)
                        } else {
                            onError('流式解析中出现未知错误')
                        }
                    }
                }
            })
        }
    } catch (err: unknown) {
        // 主动取消时不报错
        if (err instanceof DOMException && err.name === 'AbortError') {
            return
        }
        if (err instanceof Error) {
            onError(err.message)
        } else {
            onError('流式请求中出现未知错误')
        }
    }
}



