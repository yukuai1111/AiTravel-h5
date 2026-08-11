//存放用户信息
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { getUserInfoRes } from '@/interfaces/user'
import { useAIStore } from './aiStore'
export const useUserStore = defineStore('user', () => {
    const accessToken = ref<string>('')
    const refreshToken = ref<string>('')
    //定义登陆状态
    const isLogin = computed(() => {
        return !!accessToken.value
    })
    //定义用户信息
    const userInfo = ref<getUserInfoRes | null>(null)
    //登录（保存用户信息）
    const setUserInfo = (data: getUserInfoRes, access: string, refresh: string) => {
        //赋值用户信息
        userInfo.value = data
        accessToken.value = access
        refreshToken.value = refresh
        //本地存储
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        localStorage.setItem('userInfo', JSON.stringify(data))
    }
    //清除用户信息
    const clearUserInfo = () => {
        const aiStore = useAIStore()
        //清除所有ai请求
        aiStore.removeControllerAll()
        //清除方案队列
        aiStore.clearPlans()
        userInfo.value = null
        accessToken.value = ''
        refreshToken.value = ''
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
    }
    //更新用户信息
    const updateUserInfo = (data: getUserInfoRes) => {
        userInfo.value = data
        //本地存储
        localStorage.setItem('userInfo', JSON.stringify(data))
    }
    //初始化用户信息
    const initUserInfo = () => {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
            userInfo.value = JSON.parse(userInfoStr)
        }
        accessToken.value = localStorage.getItem('accessToken') || ''
        refreshToken.value = localStorage.getItem('refreshToken') || ''
    }
    initUserInfo()
    //更新两个token
    const updateToken = (access: string, refresh: string) => {
        accessToken.value = access
        refreshToken.value = refresh
        //本地存储
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
    }
    return {
        accessToken,
        refreshToken,
        isLogin,
        userInfo,
        updateUserInfo,
        setUserInfo,
        clearUserInfo,
        updateToken
    }
})