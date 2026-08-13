<template>
    <div>
        <van-popup :show="props.showLogin" round>
            <div class="popup-container">
                <div class="close-btn" @click="handleClose">
                    <van-icon name="close" size="25" />
                </div>
                <!-- 登录 -->
                <div class="item" v-if="type === 'login'">
                    <div class="popup-header">登录</div>
                    <div class="popup-content">
                        <van-form class="form">
                            <van-field class="form-login-item" v-model="formData.username" maxlength="20" label="用户名"
                                placeholder="请输入用户名" autocomplete="username" />
                            <van-field class="form-login-item" v-model="formData.password" maxlength="12" label="密码"
                                placeholder="请输入密码" type="password" autocomplete="new-password" />
                            <div class="other-action">
                                <div @click="handleType('forget')">忘记密码</div>
                                <div @click="handleType('register')">注册账号</div>
                            </div>
                            <van-button type="primary" round style="margin-top: 10px" size="large" @click="handleLogin"
                                :disabled="!formData.username || !formData.password"
                                :loading="btnLoading">登录</van-button>
                        </van-form>
                    </div>
                </div>
                <!-- 注册 -->
                <div class="item" v-if="type === 'register'">
                    <div class="popup-header">注册</div>
                    <div class="popup-content">
                        <van-form class="form">
                            <van-field class="form-item" v-model="formData.username" maxlength="10" label="用户名"
                                placeholder="请输入用户名" />
                            <van-field class="form-item" v-model="formData.code" center clearable label="验证码"
                                placeholder="请输入验证码">
                                <template #button>
                                    <van-button v-if="showGetCodeBtn && countDown === 60" size="small" type="primary"
                                        @click="handleCode(1)" :disabled="!formData.username"
                                        :loading="codeBtnLoading">发送验证码</van-button>
                                    <div v-else-if="!showGetCodeBtn && countDown !== 0" class="code_count">还剩下{{
                                        countDown }}秒</div>
                                </template>
                            </van-field>
                            <!-- 发来了验证码后并输入验证码才有密码框 -->
                            <van-field class="form-item" v-if="isShowPsd" v-model="formData.password" maxlength="12"
                                label="密码" placeholder="请输入密码" />
                            <van-field class="form-item" v-if="isShowPsd" v-model="formData.confirmPassword"
                                maxlength="12" label="确认密码" placeholder="请再次输入密码" />
                            <div class="other-action" style="justify-content: center;">
                                <div @click="handleType('login')">已有帐号?去登陆</div>
                            </div>
                            <van-button type="primary" round style="margin-top: 10px" size="large"
                                @click="handleRegister"
                                :disabled="!formData.username || !formData.code || !formData.password || !formData.confirmPassword"
                                :loading="btnLoading">注册</van-button>
                        </van-form>
                    </div>
                </div>
                <!-- 忘记密码 -->
                <div class="item" v-if="type === 'forget'">
                    <div class="popup-header">忘记密码</div>
                    <div class="popup-content">
                        <van-form class="form">
                            <van-field class="form-item" v-model="formData.username" maxlength="20" label="用户名"
                                :disabled="!!props.username" :readonly="!!props.username" placeholder="请输入用户名" />
                            <van-field class="form-item" v-model="formData.code" center clearable label="验证码"
                                placeholder="请输入验证码">
                                <template #button>
                                    <van-button v-if="showGetCodeBtn && countDown === 60" size="small" type="primary"
                                        @click="handleCode(2)" :disabled="!formData.username"
                                        :loading="codeBtnLoading">发送验证码</van-button>
                                    <div v-else-if="!showGetCodeBtn && countDown !== 0" class="code_count">还剩下{{
                                        countDown }}秒</div>
                                </template>
                            </van-field>
                            <!-- 发来了验证码后并输入验证码才有密码框 （登录后改密码只做确认，不再弹窗里修改）-->
                            <van-field class="form-item" v-if="isShowPsd && !props.username" v-model="formData.password"
                                maxlength="12" label="新密码" placeholder="请输入新密码" />
                            <!-- 登陆后的忘记密码不显示登录和注册 -->
                            <div v-if="!props.username" class="other-action">
                                <div @click="handleType('login')">已有帐号?去登陆</div>
                                <div @click="handleType('register')">注册账号</div>
                            </div>
                            <!-- 未登录的修改密码显示重置密码，直接去重置 -->
                            <van-button v-if="!props.username" type="primary" round style="margin-top: 10px"
                                size="large" @click="handleResetPassword"
                                :disabled="!formData.username || !formData.code || !formData.password"
                                :loading="btnLoading">重置密码
                            </van-button>
                            <!-- 登陆的按钮显示提交，是去验证验证码 -->
                            <van-button v-else type="primary" round style="margin-top: 10px" size="large"
                                @click="handleVerifyCode" :disabled="!formData.username || !formData.code"
                                :loading="btnLoading">提交
                            </van-button>
                        </van-form>
                    </div>
                </div>
            </div>
        </van-popup>

    </div>
    <!-- 验证码通知弹窗 -->
    <van-notify :show="code.trim() !== ''" type="success" style="height: 200px;opacity: 0.9;font-size:20px;border-radius:0 0 10px 10px;">
        <van-icon name="comment-o" style="font-size: 24px; padding:10px"/>
        <span>验证码：{{ code }}</span>
    </van-notify>
</template>

<script setup lang="ts">
import { validateUsername, validatePassword, validatePasswordSame, validateCode } from '@/utils/validate'
import { reactive, ref } from 'vue'
import { showToast, showLoadingToast } from 'vant'
import type { loginReq, regReq, getCodeRes, forgetReq } from '@/interfaces/user'
import { login, getRegCode, register, getForgetCode, forgetPassword, getLoginForgetCode, verifyLoginForgetCode } from '@/api/user'
import type { ApiResponse } from '@/interfaces/api'
import { useUserStore } from '@/stores/userStore'
import router from '@/router'
const userStore = useUserStore()
const props = defineProps({
    showLogin: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    }
})
const type = ref<string>(props.type || 'login')  //用于登录、注册、忘记密码进行切换
//切换用途
const handleType = (newType: string) => {
    type.value = newType
    //重置数据
    reset()
}

const emit = defineEmits(['close', 'verify'])
//表单数据
//登录：用户名+密码
//获取验证码：用户名
//注册：用户名+密码+确认密码+验证码
//忘记密码：用户名+新密码+验证码
const formData = reactive<{ username: string, password: string, confirmPassword: string, code: string }>({
    username: props.username,
    password: '',
    confirmPassword: '',
    code: ''
})

//按钮加载
const btnLoading = ref<boolean>(false)


//登录按钮
const handleLogin = async () => {
    if (formData.username.trim().length < 3 || formData.username.trim().length > 12) return showToast('用户名长度必须在3-12位之间')
    if (formData.password.trim().length < 6 || formData.password.trim().length > 12) return showToast('密码长度必须在6-12位之间')
    //密码只能有数字，字母和下划线
    if (!/^[a-zA-Z0-9_]+$/.test(formData.password.trim())) return showToast('密码只能有数字，字母和下划线')
    //去除多余字段
    const { confirmPassword, code, ...rest } = formData
    //去掉空格
    const loginData: loginReq = {
        username: rest.username.trim(),
        password: rest.password.trim()
    }
    btnLoading.value = true
    try {
        await toLogin(loginData)
        showToast('登录成功')
        //关闭弹窗
        handleClose()
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        }
        else {
            showToast(err as string)
        }
    } finally {
        btnLoading.value = false
    }
}
//调用登陆接口
const toLogin = async (loginData: loginReq) => {
    //调用登录接口
    const res = await login(loginData)
    if (res.data) {
        const accessToken = res.data.accessToken.split(' ')[1]
        const refreshToken = res.data.refreshToken.split(' ')[1]
        const userInfo = {
            user_id: res.data.user_id,
            username: res.data.username,
            avatar: res.data.avatar,
            create_time: res.data.create_time
        }
        //把信息存入store
        userStore.setUserInfo(userInfo, accessToken, refreshToken)
    }
}

//获取验证码按钮加载
const codeBtnLoading = ref<boolean>(false)
//获取验证码的按钮展示状态
const showGetCodeBtn = ref<boolean>(true)
//验证码倒计时
const countDown = ref<number>(60)
//验证码
const code = ref<string>('')
//是否展示密码框
const isShowPsd = ref<boolean>(false)
//定时器
let timer: number;
//获取验证码
const handleCode = async (origin: number) => {
    codeBtnLoading.value = true
    if (formData.username.trim().length < 3) return showToast('用户名长度不能小于3位')
    //调用接口获取验证码
    try {
        //判断来源origin  => 1:注册  2:忘记密码
        let res: ApiResponse<getCodeRes>;
        if (origin === 1) { res = await getRegCode({ username: formData.username.trim() }) }
        else if (origin === 2) {
            //判断登录后还是登录前
            if (props.username) {
                if (!userStore.isLogin) {
                    router.push('/detail')
                    return
                }
                //登录后获取验证码
                res = await getLoginForgetCode({ username: props.username })
            } else {
                res = await getForgetCode({ username: formData.username.trim() })
            }
        }
        else return showToast('网络异常')
        showGetCodeBtn.value = false
        //开启定时器，倒计时
        timer = setInterval(() => {
            countDown.value--
            //时间到
            if (countDown.value === 0) {
                //让按钮重新显示
                showGetCodeBtn.value = true
                //重置时间
                countDown.value = 60
                //重置验证码
                code.value = ''
                showToast('验证码已过期，请重新获取')
                //关闭定时器
                clearInterval(timer)
                return
            }
        }, 1000)
        if (res.data) {
            code.value = res.data.code
            //展示密码框
            isShowPsd.value = true
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        }
        else {
            showToast(err as string)
        }
    } finally {
        codeBtnLoading.value = false
    }
}

//注册按钮
const handleRegister = async () => {
    //校验用户名
    const validUsernameResult = validateUsername(formData.username)
    if (validUsernameResult !== true) return showToast(validUsernameResult)
    //校验密码
    const validPasswordResult = validatePassword(formData.password)
    if (validPasswordResult !== true) return showToast(validPasswordResult)
    //校验确认密码
    const validConfirmPasswordResult = validatePassword(formData.confirmPassword)
    if (validConfirmPasswordResult !== true) return showToast(validConfirmPasswordResult)
    //校验密码是否相同
    const validPsdSameResult = validatePasswordSame(formData.password, formData.confirmPassword)
    if (validPsdSameResult !== true) return showToast(validPsdSameResult)
    //校验验证码
    const validCodeResult = validateCode(formData.code)
    if (validCodeResult !== true) return showToast(validCodeResult)
    const regData: regReq = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim(),
        code: formData.code.trim()
    }
    btnLoading.value = true
    //调用接口
    try {
        await register(regData)
        showLoadingToast({
            message: '注册成功！正在自动登录...',
            forbidClick: true,
            duration: 1000
        })
        setTimeout(async () => {
            try {
                //自动登录
                await toLogin({ username: regData.username, password: regData.password })
                showToast({
                    message: '自动登录成功',
                    duration: 1000
                })
                //关闭弹窗
                handleClose()
            } catch (err: unknown) {
                //清除数据
                reset()
                //跳转登录页
                type.value = 'login'
                if (err instanceof Error) {
                    showToast({
                        message: err.message + '，请手动登录！',
                        duration: 3000
                    })
                }
                else {
                    showToast({
                        message: (err as string) + "，请手动登录！",
                        duration: 3000
                    })
                }
            }
        }, 2000)
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        }
        else {
            showToast(err as string)
        }
    } finally {
        btnLoading.value = false
        //重置验证码
        code.value = ''
    }
}

//没登陆时忘记密码--重置密码
const handleResetPassword = async () => {
     //校验用户名
    const validUsernameResult = validateUsername(formData.username)
    if (validUsernameResult !== true) return showToast(validUsernameResult)
    //校验密码
    const validPasswordResult = validatePassword(formData.password)
    if (validPasswordResult !== true) return showToast(validPasswordResult)
    //校验验证码
    const validCodeResult = validateCode(formData.code)
    if (validCodeResult !== true) return showToast(validCodeResult)

    const forgetData: forgetReq = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        code: formData.code.trim()
    }
    btnLoading.value = true
    try {
        await forgetPassword(forgetData)
        showToast('重置密码成功')
        type.value = 'login'
        reset()
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    } finally {
        btnLoading.value = false
    }
}

//登录后验证验证码按钮
const handleVerifyCode = async () => {
    //校验验证码
    const validCodeResult = validateCode(formData.code)
    if (validCodeResult !== true) return showToast(validCodeResult)
    
    btnLoading.value = true
    //登录时的忘记密码，只判断验证码
    try {
        const res = await verifyLoginForgetCode({ username: props.username, code: formData.code.trim() })
        console.log(res)
        if (res.data) {
            //验证码判断正确就可以关闭弹窗
            handleClose()
            showToast('验证码正确')
            //通知父组件验证码正确，可以重置密码
            emit('verify', res.data.resetToken)
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    } finally {
        btnLoading.value = false
    }

}

//关闭弹窗，利用emit提醒父组件
const handleClose = () => {
    //重置数据
    reset()
    if (!props.username) {
        formData.username = ''
        type.value = 'login'
    }
    emit('close')
}
//重置数据
const reset = () => {
    //清空表单数据
    formData.password = ''
    formData.confirmPassword = ''
    formData.code = ''
    //重置状态
    codeBtnLoading.value = false
    showGetCodeBtn.value = true
    countDown.value = 60
    isShowPsd.value = false
    btnLoading.value = false
    //重置验证码
    code.value = ''
    //清除定时器
    clearInterval(timer)
}
</script>

<style scoped lang="scss">
.popup-container {
    position: relative;

    .close-btn {
        position: absolute;
        top: 18px;
        right: 18px;
    }

    .item {
        padding: 20px 30px;

        .popup-header {
            text-align: center;
            font-size: 20px;
            font-weight: 500;
            margin: 0 0 24px;
            color: #333;
        }

        .popup-content {
            margin-bottom: 20px;

            .form {
                :deep(.van-field) {
                    margin-bottom: 10px;
                }

                .form-login-item {
                    padding: 10px 23px;
                }

                .form-item {
                    padding: 12px 7px;
                }
            }

            .other-action {
                margin: 6px 15px 22px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
                color: #409eff;
                font-size: 14px;
            }
        }
    }
}
</style>