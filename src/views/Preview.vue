<template>
    <div class="perview-page">
        <div class="page-header">
            <van-nav-bar fixed title="裁剪头像" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content">
            <div class="cropper-box">
                <vue-cropper ref="cropperRef" :img="previewAvatar" :autoCrop="true" :fixed="true" :fixedNumber="[1, 1]"
                    :fixedBox="true" :canMove="true" :canScale="true" :centerBox="true" :outputSize="1"
                    :outputType="'png'" />
            </div>
            <div class="actions">
                <van-button plain hairline type="primary" block @click="router.back()">
                    取消
                </van-button>
                <van-button type="primary" block :loading="uploading" @click="confirmCrop">
                    确认
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { updateAvatar } from '@/api/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const previewAvatar = ref<string>('')

const cropperRef = ref<InstanceType<typeof VueCropper>>()

const uploading = ref(false)

onMounted(() => {
    previewAvatar.value = route.query.avatar as string
})

//确定裁剪完图片可以上传
const confirmCrop = () => {
    // 如果组件没初始化好，直接返回
    if (!cropperRef.value) return

    uploading.value = true

    //getCropBlob 是 vue-cropper 提供的方法
    //它会根据当前裁剪框的位置，把框内的图片截出来，生成一个 Blob 对象
    //Blob 是浏览器里的二进制数据对象，类似 File
    cropperRef.value.getCropBlob((blob: Blob | null) => {
        // 如果 blob 为空，说明裁剪失败
        if (!blob) {
            showToast('裁剪失败')
            uploading.value = false
            return
        }
        //把 Blob 转成 File
        //第一个参数是二进制数据，第二个是文件名，第三个是文件类型
        //后端 multer 接收的是 'avatar' 字段的文件
        const file = new File([blob], 'avatar.png', { type: 'image/png' })
        // console.log("上传的文件", file)
        updateAvatar({ avatar: file })
            .then(() => {
                showToast('头像修改成功')
                // 上传成功返回上一页
                router.back()
            })
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    showToast(err.message)
                }
                showToast(err as string)
            })
            .finally(() => {
                uploading.value = false
            })
    })
}
</script>

<style scoped lang="scss">
/* 页面铺满整个屏幕，黑色背景 */
.perview-page {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .page-content {
        margin-top: 100px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .cropper-box {
            flex: 1;
            width: 100vw;
            overflow: hidden;
        }

        .actions {
            padding: 16px 20px;
            display: flex;
            gap: 16px;
            background: #fff;
        }

        .actions .van-button {
            flex: 1;
        }
    }


}
</style>