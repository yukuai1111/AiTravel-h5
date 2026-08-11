//全局管理状态
import {defineStore} from 'pinia'
import {ref} from 'vue'
export const useGlobalStore=defineStore('global',()=>{
    //定义登录弹窗状态
    const showLogin=ref<boolean>(false)
    return {
        showLogin,
    }
})
