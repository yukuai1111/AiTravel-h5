//调用刷新token的接口
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import type { ApiResponse } from '@/interfaces/api'
const baseURL = import.meta.env.VITE_API_BASEURL

export const getNewToken = async () => {
    const userStore = useUserStore()
    //判断刷新token存不存在
    const refreshToken = userStore.refreshToken
    if (!refreshToken) {
        throw new Error('刷新token不存在,请重新登录')
    }
    //存在就调用接口
    const res = await axios.post<ApiResponse<{ accessToken: string, refreshToken: string }>>(baseURL + '/user/refreshToken',
        {},
        {
            headers: {
                'Authorization': 'Bearer ' + refreshToken
            }
        }
    )
    if (res.data.status === 403) {
        throw new Error(res.data.msg)
    }
    if (!res.data.data) {
        throw new Error('数据为空')
    }
    return res.data.data
}
