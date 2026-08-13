<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed :title="shareDetail.title" />
        </div>
        <div class="page-content">
            <!-- 如果接口异常 -->
            <div v-if="!shareDetail.plan_id">
                <van-empty image="network" description="页面走失啦，请重试...." />
            </div>
            <!-- 接口正常返回 -->
            <div v-else>
                <!-- 分享头部卡片 -->
                <div class="share-card">
                    <div class="share-title">
                        <van-image width="30" height="30" :src="`${baseURL}${shareDetail.avatar}`" />
                        {{ shareDetail.username }} 分享了一份旅游方案给你~
                    </div>
                    <div class="share-row">
                        <van-icon name="clock" size="20" />
                        <span>方案生成时间：{{ dayjs(shareDetail.plan_create_time).format('YYYY-MM-DD HH:mm') }}</span>
                    </div>
                    <div class="share-row">
                        <van-icon name="location" size="20" />
                        <span> 方案分享时间：{{ dayjs(Number(shareTime)).format('YYYY-MM-DD HH:mm') }}</span>
                    </div>
                    <div class="download">
                        <van-button :loading="downloadLoading" type="primary" plain size="small" @click="downloadPlan">
                            <van-icon name="down" />Download</van-button>
                    </div>
                </div>
                <!-- pdf截取 -->
                <div ref="pdfContent">
                    <!-- 标题 -->
                    <div class="card" style="box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);height:65px;width: 100%;">
                        <Session-title :title="shareDetail.content.city + '·' + shareDetail.content.days + '天行程'"
                            :isBudget="true" :budget="shareDetail.content.totalBudget" />
                    </div>
                    <!-- 行程安排 -->
                    <van-collapse v-model="activeNames">
                        <van-collapse-item v-for="day in shareDetail.content.dailyItinerary" :key="day.day"
                            :title="day.date" :name="day.day">
                            <div class="day-schedule">
                                <Day-schedule v-if="day.morning" :timeData="day.morning" timeText="上午"
                                    timeBgColor="#fff6ed" timeTextColor="#d97706" />
                                <Day-schedule v-if="day.afternoon" :timeData="day.afternoon" timeText="下午"
                                    timeBgColor="#edf7ff" timeTextColor="#0284c7" />
                                <Day-schedule v-if="day.evening" :timeData="day.evening" timeText="晚上"
                                    timeBgColor="#f6ffed" timeTextColor="#52c41a" />
                            </div>
                        </van-collapse-item>
                    </van-collapse>
                    <!-- 预算明细 -->
                    <div class="card box-shadow" style="margin-top: 20px;">
                        <Session-title title="预算明细" />
                        <div class="budget-list">
                            <Budget-item v-if="shareDetail.content.budgetBreakdown && shareDetail.content.totalBudget"
                                :budgetValue="shareDetail.content.budgetBreakdown" />
                        </div>
                    </div>
                    <!-- 提示 -->
                    <div class="card box-shadow">
                        <Session-title title="温馨提示" />
                        <TipsAndWarnings v-if="shareDetail.content.tips && shareDetail.content.tips.length"
                            :tipsOrWarnings="shareDetail.content.tips" />
                    </div>
                    <!-- 警告 -->
                    <div class="card box-shadow" style="margin-bottom: 20px;">
                        <Session-title title="注意事项" />
                        <TipsAndWarnings v-if="shareDetail.content.warnings && shareDetail.content.warnings.length"
                            :tipsOrWarnings="shareDetail.content.warnings" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { sharePlanDetail } from '@/api/travel'
import { showToast } from 'vant'
import type { getShareDetailRes } from '@/interfaces/travel'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'

const baseURL = import.meta.env.VITE_IMG_BASEURL
const route = useRoute()
const code = ref<string>('')
const shareTime = ref<string>('')
const shareDetail = reactive<getShareDetailRes>({
    plan_id: 0,
    title: '',
    plan_create_time: 0,
    username: '',
    avatar: '',
    content: {
        city: "",
        days: 0,
        success: false,
        totalBudget: 0,
        budgetBreakdown: {
            accommodation: 0,
            food: 0,
            tickets: 0,
            transportation: 0,
            other: 0,
        },
        dailyItinerary: [],
        tips: [],
        warnings: [],
    }
})
//获取详情信息
const getDetail = async () => {
    try {
        const res = await sharePlanDetail(code.value)
        console.log(res)
        if (res.data) {
            shareDetail.plan_id = res.data.plan_id
            shareDetail.title = res.data.title
            shareDetail.plan_create_time = res.data.plan_create_time
            shareDetail.username = res.data.username
            shareDetail.content = res.data.content
            shareDetail.avatar = res.data.avatar
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    }
}

//展开面板
const activeNames = ref<number[]>([])
onMounted(() => {
    code.value = route.query.code as string
    shareTime.value = route.query.time as string
    getDetail()
})

const downloadLoading = ref<boolean>(false)
//截取pdf内容
const pdfContent = ref<HTMLDivElement>()
//下载计划
const downloadPlan = async () => {
    if (downloadLoading.value) return showToast('请稍后再试')
    downloadLoading.value = true
    if (!shareDetail.content.dailyItinerary?.length) return showToast('计划为空')
    activeNames.value = shareDetail.content.dailyItinerary?.map(item => {
        return item.day as number
    })
    console.log(activeNames.value)
    showToast('下载中...')
    if (!pdfContent.value || activeNames.value.length !== shareDetail.content.days) return showToast('内容未加载完毕')
    // 等待内容加载完成
    await nextTick()
    // 等待500ms，确保内容加载完成
    await new Promise(resolve => setTimeout(resolve, 500))
    html2pdf().set({
        //填入配置
        margin: 10,  //页面边距
        filename: `${shareDetail.title}.pdf`,
        image: {  //先转成图片，再转成pdf
            type: 'jpeg',
            quality: 0.98   //清晰度
        },
        html2canvas: {  //截图
            scale: 2,      // 截图分辨率
            useCORS: true  // 允许截取跨域图片
        },
        jsPDF: {  //转成pdf
            unit: 'mm', // 单位
            format: 'a4', // 页面大小
            orientation: 'portrait', // 横竖向
        }
    }).from(pdfContent.value)
        .save()
        .then(() => {
            showToast('下载成功')
        }).catch((err) => {
            console.log('下载失败', err)
            showToast('下载失败')
        }).finally(() => {
            downloadLoading.value = false
        })
}

</script>

<style scoped lang="scss">
.page-header {
    height: 60px;
    font-size: 20px
}

.page-content {
    padding: 12px;

    .share-card {
        position: relative;
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f0f7ff;
        border-radius: 16px;

        .share-title {
            font-size: 16px;
            font-weight: 500;
            color: #222;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .share-row {
            font-size: 14px;
            color: #999;
            line-height: 2;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .download {
            position: absolute;
            top: 60px;
            right: 7px;

            .van-button {
                height: 50px;
                font-size: 13px
            }
        }

    }

    .box-shadow {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .footer-btn {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        background-color: #fff;
        padding: 10px;
    }
}
</style>