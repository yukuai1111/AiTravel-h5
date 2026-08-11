//判断是否登录
import { useUserStore } from "@/stores/userStore";
import { useGlobalStore } from "@/stores/globalStore";
import { showToast } from 'vant'

const userStore = useUserStore()
const globalStore = useGlobalStore()
export const requireAuth = (msg: string='请先登录') => {
    if (!userStore.isLogin) {
        //没登陆就打开登陆弹窗
        globalStore.showLogin = true
        showToast({
            message: msg,
            duration: 2000
        })
        return false
    }
    return true
}