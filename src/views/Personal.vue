<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="个人资料" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content" v-if="userInfo">
            <van-cell title="用户ID" center size="large" :value="userInfo.user_id" />
            <div class="change-avatar">
                <van-uploader :after-read="changeAvatar" :max-count="1">
                    <van-cell title="头像" center is-link size="large">
                        <template #value>
                            <van-image width="60" height="60" :src="previewAvatar || baseURL + userInfo.avatar" />
                        </template>
                    </van-cell>
                </van-uploader>
            </div>

            <van-cell title="用户名" center is-link size="large" :value="userInfo.username" @click="handleUsernameClick" />
            <van-cell title="旅龄" center size="large" :value="`${getTravelAge(userInfo.create_time)}岁`" />
            <!-- 修改用户名 -->
            <van-popup v-model:show="showUsername" style="padding:28px;border-radius: 12px;">
                <van-cell-group title="好名字可以让大家更容易记住你~">
                    <van-field :border="false" size="large" v-model="newUsername"
                        style="font-size: 18px;height: 40%;" :autofocus="true" />
                </van-cell-group>
                <div class="suggest-container" v-if="suggestionName.length > 0">
                    <div class="header">推荐名字：</div>
                    <van-cell style="font-size: 16px;" center v-for="item in suggestionName" :key="item" :title="item"
                        @click="newUsername = item" />
                </div>
                <van-button style="margin-top: 20px;" type="primary" block @click="changeUsername" :loading="changeLoading">确认用户名</van-button>
            </van-popup>

        </div>

    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, watchEffect } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getUserInfo, updateUsername } from '@/api/user'
import type { getUserInfoRes } from '@/interfaces/user'
import { showToast } from 'vant'
import type { UploaderFileListItem } from 'vant'
const baseURL = import.meta.env.VITE_IMG_BASEURL
const userStore = useUserStore()
const router = useRouter()
//用户信息
const userInfo = ref<getUserInfoRes>()
//获取用户信息
const getInfo = async () => {
    const res = await getUserInfo()
    userInfo.value = res.data
    if (userInfo.value) {
        userStore.updateUserInfo(userInfo.value)
    }
}
//注册时间转换成旅龄
const getTravelAge = (createTime: number) => {
    const now = new Date().getTime()
    const age = Math.floor((now - createTime) / (1000 * 60 * 60 * 24 * 365))
    return age
}

//修改用户名loading状态
const changeLoading = ref<boolean>(false)
//展示求该用户名弹窗
const showUsername = ref<boolean>(false)
//新用户名
const newUsername = ref<string>('')
//推荐名字
const suggestionName = ref<string[]>([])
//头像预览地址
const previewAvatar = ref<string>('')
//点击用户名
const handleUsernameClick = () => {
    showUsername.value = true
    newUsername.value = userInfo.value?.username || ''
}
//修改用户名
const changeUsername = async () => {
    if (changeLoading.value) return
    changeLoading.value = true
    if (!newUsername.value) {
        showToast('用户名不能为空')
        return
    }
    try {
        const res = await updateUsername({ username: newUsername.value })
        if (res.status === 200) {
            showToast('修改成功')
            showUsername.value = false
            suggestionName.value = []
            //刷新页面
            getInfo()
        } else {
            //名字重复
            showToast(res.msg)
            if (res.data && res.data.suggestUsername) {
                //推荐名字
                suggestionName.value = res.data.suggestUsername
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    } finally {
        changeLoading.value = false
    }

}

//修改头像
const changeAvatar = async (file: UploaderFileListItem | UploaderFileListItem[]) => {
    const item = Array.isArray(file) ? file[0] : file
    if (!item.file) {
        showToast('请上传头像')
        return
    }
    if (!item.file.type.startsWith('image/')) {
        showToast('请上传图片')
        return
    }
    if (item.file.size > 1024 * 1024 * 2) {
        showToast('图片大小不能超过2MB')
        return
    }
    // 跳转图片预览页,进行裁剪
    router.push({
        name: 'preview',
        query: {
            avatar: item.content || URL.createObjectURL(item.file)
        }
    })
}
watchEffect(() => {
    if (!showUsername.value) {
        suggestionName.value = []
    }
})
onMounted(() => {
    getInfo()
})
</script>

<style scoped lang="scss">
.page-container {
    .page-header {
      height: 46px;
    }
    .page-content {
        position: absolute;

        .suggest-container {
            margin-top: 20px;
            width: 100%;
            height: 200px;
            overflow-y: auto;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;

            .header {
                font-size: 18px;
                font-weight: bold;
                color: #323233;
                margin-bottom: 10px;
            }

        }

        .change-avatar {
            :deep(.van-uploader__input-wrapper) {
                width: 100vw !important;
            }
        }
    }
}
</style>