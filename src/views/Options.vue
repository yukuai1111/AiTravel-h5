<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="设置" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content">
            <div class="item">
                <van-cell-group title="账号">
                    <van-cell title="个人资料" to="/my/personal" is-link size="large" />
                    <van-cell title="账号安全" to="/my/safe" is-link size="large" />
                </van-cell-group>
            </div>
            <div class="item">
                <van-cell-group title="通用">
                    <van-cell title="分享权限" to="/my/share" is-link size="large" />
                </van-cell-group>
            </div>
            <div class="item btns">
                <van-button :loading="logoutLoading" size="large" block type="primary"
                    @click="handleLogout">退出登录</van-button>
                <van-button :loading="removeLoading" size="large" block type="danger"
                    @click="handleRemove">注销账号</van-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { logout, removeAccount } from '@/api/user'
import { useUserStore } from '@/stores/userStore';
import { showConfirmDialog, showToast } from 'vant';
const userStore = useUserStore()
//退出登录按钮加载
const logoutLoading = ref<boolean>(false)
// 退出登录
const handleLogout = () => {
    //判断有没有登陆，没有登陆的话蹦出弹窗
    if (logoutLoading.value) return
    logoutLoading.value = true
    showConfirmDialog({
        title: '确认退出登录吗？',
        message:
            '请确保AI服务已关闭，否则可能会导致数据丢失。确认退出登录吗？',
    })
        .then(async () => {
            try {
                console.log('用户退出登录')
                const res=await logout(userStore.refreshToken)
                console.log(res)
            } catch (err) {
                console.log("退出登陆错误", err)
            } finally {
                console.log('进入了finally，开始清除userinfo',userStore.userInfo)
                userStore.clearUserInfo()
                console.log('清除userinfo后',userStore.userInfo)
                router.push({
                    path: '/profile',
                    query: {
                        msg: '退出登录成功'
                    }
                })
                logoutLoading.value = false
            }
        })
        .catch(() => {
            showToast('退出登录已取消')
            logoutLoading.value = false
        });

}
//注销账号按钮加载
const removeLoading = ref<boolean>(false)
//注销账号
const handleRemove = () => {
    if (removeLoading.value) return
    removeLoading.value = true
    showConfirmDialog({
        title: '确认注销账号吗？',
        message:
            '注销账号后，所有数据将被删除。是否继续？',
    })
        .then(async () => {
            try {
                await removeAccount()
                userStore.clearUserInfo()
                router.push({
                    path: '/profile',
                    query: {
                        msg: '注销账号成功'
                    }
                })
            } catch (err) {
                if (err instanceof Error) {
                    showToast(err.message)
                } else {
                    showToast(err as string)
                }
            } finally {
                removeLoading.value = false
            }
        })
        .catch(() => {
            showToast('注销账号已取消')
            removeLoading.value = false
        });
}
</script>

<style scoped lang="scss">
.page-container {
    position: relative;

    .page-content {
        margin-top: 50px;

        .item {
            margin-bottom: 15px;
        }

        .btns {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
    }
}
</style>