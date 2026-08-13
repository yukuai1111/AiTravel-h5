<template>
    <div class="perview-page">
        <div class="page-header">
            <van-nav-bar fixed title="裁剪头像" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content">
            <!-- 加载 -->
            <div v-if="loading" class="loading-box">
                <van-loading size="40" />
                <p style="margin-top: 12px; color: #999;">图片加载中...</p>
            </div>

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
import { useRouter } from 'vue-router'
import { ref, onMounted,watch, nextTick } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { updateAvatar } from '@/api/user'
import { showToast } from 'vant'

const router = useRouter()

const previewAvatar = ref<string>('')

const cropperRef = ref<InstanceType<typeof VueCropper>>()

//裁剪完成的加载
const uploading = ref(false)

// 加载要裁剪的图片
const loading = ref<boolean>(true)

onMounted(() => {
    const data = sessionStorage.getItem('previewAvatar') || ''
    if (data) {
        previewAvatar.value = data
    } else {
        console.log('没有图片数据')
        showToast('没有图片数据，请重试')
        loading.value = false
        setTimeout(() => {
            router.back()
        }, 1500)
    }
})

// 监听图片地址变化
watch(previewAvatar, async (newVal) => {
    if (!newVal) return

    // 原生Image对象预加载图片资源
    const img = new Image()
    img.src = newVal

    img.onload = async () => {
        console.log('✓ 图片资源加载完成，等待cropper渲染')
        await nextTick()
        // 短暂延时，留给vue-cropper渲染时间
        setTimeout(() => {
            loading.value = false
        }, 150)
    }

    img.onerror = () => {
        console.log('✗ 图片资源加载失败')
        loading.value = false
        showToast('图片加载失败')
        setTimeout(() => {
            router.back()
        }, 1500)
    }
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
        console.log('getCropBlob 结果:', blob)
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
.perview-page {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .page-content {
        position: relative;
        margin-top: 100px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .loading-box {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #ffffff;
            z-index: 9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

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
