<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed left-arrow @click-left="router.back()" title="设置密码">
                <template #right>
                    <van-button type='success' size="small" @click="handleChangePsd">完成</van-button>
                </template>
            </van-nav-bar>
        </div>
        <div style="padding:18px;font-size: 14px;color: #999;"> 为了能顺利登录，您需要设置密码。</div>
        <van-form>
            <van-field class="form-item" size="large" autocomplete="off" readonly disabled
                model-value="userStore.userInfo.userId" label="用户ID" />
            <!-- 没验证时，显示原密码输入框 -->
            <van-field v-if="!resetToken" class="form-item" size="large" placeholder="填写原密码"
                autocomplete="current-password" v-model="formData.oldPassword" type="password" label="原密码"
                maxlength="12" />
            <van-field class="form-item" size="large" placeholder="填写新密码" autocomplete="new-password"
                v-model="formData.newPassword" type="password" label="新密码" maxlength="12" />
            <van-field class="form-item" size="large" placeholder="再次填写确认" autocomplete="new-password"
                v-model="formData.confirmPassword" type="password" label="确认密码" maxlength="12" />
        </van-form>
        <div class="tip">
            <div class="tip-top">密码必须是6-12位的，只能含有字母、数字和下划线。</div>
            <!-- 没验证时，显示忘记密码链接 -->
            <div v-if="!resetToken" class="tip-bottom" @click="forgetPsd">忘记原密码？</div>
        </div>

        <!-- 忘记密码 -->
        <LoginPopup :showLogin="showForgetPopup" @close="showForgetPopup = false"
            :username="userStore.userInfo!.username" type="forget" @verify="isVerify" />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { reactive, ref } from 'vue';
import { showToast } from 'vant';
import { resetPsdByCode, resetPsd } from '@/api/user';
import { validatePasswordSame, validatePassword } from '@/utils/validate';
import type { forgetResetPsdReq, normalResetPsdReq } from '@/interfaces/user';
const router = useRouter()
const userStore = useUserStore()
const showForgetPopup = ref<boolean>(false)
const formData = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
})
//点击忘记密码
const forgetPsd = () => {
    showForgetPopup.value = true
}
//验证码通过后获取的resetToken
const resetToken = ref<string>('')
const isVerify = (val: string) => {
    resetToken.value = val
}

//最后修改密码
const handleChangePsd = async () => {
    //校验新密码
    const validateNewPasswordResult = validatePassword(formData.newPassword)
    if (validateNewPasswordResult !== true) return showToast(validateNewPasswordResult)
    //校验确认密码
    const validConfirmPasswordResult = validatePassword(formData.confirmPassword)
    if (validConfirmPasswordResult !== true) return showToast(validConfirmPasswordResult)
    //校验密码是否相同
    const validSameResult = validatePasswordSame(formData.newPassword, formData.confirmPassword)
    if (validSameResult !== true) return showToast(validSameResult)
    //分为忘记密码
    if (resetToken.value) {
        const { oldPassword, ...rest } = formData
        const resetData: forgetResetPsdReq = {
            username: userStore.userInfo!.username,
            ...rest,
            resetToken: resetToken.value.split(' ')[1]
        }
        //修改密码
        try {
            await resetPsdByCode(resetData)
            //清除用户信息
            userStore.clearUserInfo()
            //跳转个人中心页登录
            router.push({ name: 'profile', query: { msg: '修改成功，请重新登录' } }).catch(()=> {
            })
        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        }
    } else {
        //没忘记密码
        //多出一个校验原密码
        const validOldPasswordResult = validatePassword(formData.oldPassword)
        if (validOldPasswordResult !== true) return showToast(validOldPasswordResult)
        const resetData: normalResetPsdReq = {
            username: userStore.userInfo!.username,
            ...formData
        }
        try {
            await resetPsd(resetData)
            //清除用户信息
            userStore.clearUserInfo()
            //跳转个人中心页登录
            router.push({ name: 'profile', query: { msg: '修改成功，请重新登录' } }).catch(() => {
            })
        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        }
    }
}
</script>

<style scoped lang="scss">
.page-container {
    .page-header {
        height: 46px;
    }

    .form-item {
        padding: 18px
    }

    .tip {
        padding: 8px 18px 18px;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        color: #999;
        font-size: 14px;
        gap: 10px;

        .tip-top {
            color: #2c2c2c;
        }

        .tip-bottom {
            color: #1989fa
        }
    }
}
</style>