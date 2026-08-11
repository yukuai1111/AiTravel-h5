<template>
    <div class="page-container">
        <div class="page-header">
            <!-- 路由参数不完整 -->
            <van-nav-bar v-if="msg" fixed left-arrow left-text="返回" @click-left="router.push('/')" />
            <van-nav-bar v-else-if="origin === 'home'" fixed :title="formData.city + '规划行程'" left-arrow left-text="返回"
                @click-left="goBack" />
            <van-nav-bar v-else-if="origin === 'history'" fixed>
                <template #left>
                    <!-- 返回按钮在既没有编辑也没有预览时才有 -->
                    <van-icon v-if="!isEdit && !isPreview" name="arrow-left" size="22" @click="goBack" />
                    <!-- 预览按钮在编辑并且没在预览的时候才有 -->
                    <van-button v-else-if="isEdit && !isPreview" type="primary" plain size="small"
                        @click="preview">预览</van-button>
                </template>
                <template #title>
                    <div class="title" v-if="!isEdit">{{ plan_detail.title }}</div>
                    <van-field v-else type="text" v-model="plan_detail.title" autofocus
                        style="font-size:15px;width:600px" />
                </template>
                <template #right>
                    <van-icon v-if="!isEdit" name="edit" size="22" @click="changeTitle" />
                    <van-icon v-else type=v-else name="close" size="22" @click="handleClose" />
                    <van-icon v-if="!isEditOk" name="passed" size="22" @click="handlePassed" />
                </template>
            </van-nav-bar>
        </div>
        <div class="page-content">
            <!-- 加载中 -->
            <div class="loading-container flex-center" v-if="isLoading">
                <van-loading v-if="origin === 'home'" size="24px" type="spinner">正在生成旅游规划...</van-loading>
                <van-loading v-else size="24px" type="spinner">正在获取方案详情...</van-loading>
            </div>
            <!-- 如果接口异常/参数不完整 -->
            <div v-else-if="msg">
                <van-empty image="network" :description="msg" />
                <div class="flex-center" style="margin-top: 20px;">
                    <van-button v-if="userStore.isLogin && origin === 'home'&&formData.city&&formData.budget&&formData.days" type="primary"
                        @click="getTravelPlan" :loading="planLoading">重新获取</van-button>
                    <van-button v-else-if="userStore.isLogin && origin === 'history'&&plan_id" type="primary"
                        @click="getDetail" :loading="planLoading">重新获取</van-button>
                    <van-button v-else-if="!userStore.isLogin" type="primary"
                        @click="router.push('/profile')">登录</van-button>
                </div>
            </div>
            <!-- 接口正常返回 -->
            <div v-else>
                <!-- 标题 -->
                <div class="card" style="box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);height:65px;width: 100%;">
                    <Session-title v-if="origin === 'home'" :title="planData.city + '·' + planData.days + '天行程'"
                        :isBudget="true" :budget="planData.totalBudget" :topTitle="true" :plan_id="plan_id"
                        :isCollected="planData.is_collected" @changeCollect="update" />
                    <Session-title v-else :title="plan_detail.content.city + '·' + plan_detail.content.days + '天行程'"
                        :isBudget="true" :budget="plan_detail.content.totalBudget" :topTitle="true" :plan_id="plan_id"
                        :isCollected="plan_detail.is_collected" @changeCollect="update" />
                </div>
                <!-- 行程安排 -->
                <van-collapse v-model="activeNames" v-if="origin === 'home'">
                    <van-collapse-item v-for="day in planData.dailyItinerary" :key="day.day" :title="day.date"
                        :name="day.day">
                        <div class="day-schedule">
                            <Day-schedule v-if="day.morning" :timeData="day.morning" timeText="上午" timeBgColor="#fff6ed"
                                timeTextColor="#d97706" />
                            <Day-schedule v-if="day.afternoon" :timeData="day.afternoon" timeText="下午"
                                timeBgColor="#edf7ff" timeTextColor="#0284c7" />
                            <Day-schedule v-if="day.evening" :timeData="day.evening" timeText="晚上" timeBgColor="#f6ffed"
                                timeTextColor="#52c41a" />
                        </div>
                    </van-collapse-item>
                </van-collapse>
                <van-collapse v-model="activeNames" v-else>
                    <van-collapse-item v-for="day in plan_detail.content.dailyItinerary" :key="day.day"
                        :title="day.date" :name="day.day">
                        <div class="day-schedule">
                            <Day-schedule v-if="day.morning" :timeData="day.morning" timeText="上午" timeBgColor="#fff6ed"
                                timeTextColor="#d97706" />
                            <Day-schedule v-if="day.afternoon" :timeData="day.afternoon" timeText="下午"
                                timeBgColor="#edf7ff" timeTextColor="#0284c7" />
                            <Day-schedule v-if="day.evening" :timeData="day.evening" timeText="晚上" timeBgColor="#f6ffed"
                                timeTextColor="#52c41a" />
                        </div>
                    </van-collapse-item>
                </van-collapse>
                <!-- 预算明细 -->
                <div class="card box-shadow" style="margin-top: 20px;">
                    <Session-title title="预算明细" />
                    <div class="budget-list">
                        <Budget-item v-if="planData.budgetBreakdown && planData.totalBudget && origin === 'home'"
                            :budgetValue="planData.budgetBreakdown" />
                        <Budget-item
                            v-if="plan_detail.content.budgetBreakdown && plan_detail.content.totalBudget && origin === 'history'"
                            :budgetValue="plan_detail.content.budgetBreakdown" />
                    </div>
                </div>
                <!-- 提示 -->
                <div class="card box-shadow">
                    <Session-title title="温馨提示" />
                    <TipsAndWarnings v-if="planData.tips && planData.tips.length && origin === 'home'"
                        :tipsOrWarnings="planData.tips" />
                    <TipsAndWarnings
                        v-if="plan_detail.content.tips && plan_detail.content.tips.length && origin === 'history'"
                        :tipsOrWarnings="plan_detail.content.tips" />
                </div>
                <!-- 警告 -->
                <div class="card box-shadow" style="margin-bottom: 20px;">
                    <Session-title title="注意事项" />
                    <TipsAndWarnings v-if="planData.warnings && planData.warnings.length && origin === 'home'"
                        :tipsOrWarnings="planData.warnings" />
                    <TipsAndWarnings
                        v-if="origin === 'history' && plan_detail.content.warnings && plan_detail.content.warnings.length"
                        :tipsOrWarnings="plan_detail.content.warnings" />
                </div>
                <!-- 咨询AI按钮 -->
                <div class="footer-btn flex-center" v-if="planData.success && origin === 'home'">
                    <van-button type="primary" @click="goChat" block size="large" round>咨询AI助手</van-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PlanFormData } from '@/interfaces/home'
import type { TravelDetail } from '@/interfaces/api'
import type { getDetailRes } from '@/interfaces/travel'
import { getPlan, planDetail, changePlanTitle } from '@/api/travel'
import { showToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/userStore'
import { useAIStore } from '@/stores/aiStore'
import { validateTitle } from '@/utils/validate'
const userStore = useUserStore()
const aiStore = useAIStore()
const route = useRoute()
const router = useRouter()
const formData = reactive<PlanFormData>({
    city: '',
    budget: undefined,
    days: undefined
})

//路由来源
const origin = ref<string>('')
//加载状态
const isLoading = ref<boolean>(false)
//接口异常状态文本
const msg = ref<string>('')
//展开面板
const activeNames = ref<number[]>([])
//方案队列id
const queueId = ref<string>('')
//重新获取按钮loading状态
const planLoading = ref<boolean>(false)

//获取的方案数据
const planData = ref<TravelDetail>({
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
    is_collected: false,
})
//获取规划方案
const getTravelPlan = async () => {
    //判断是否正在加载中
    if (planLoading.value) return showFailToast('请稍后再试')
    planLoading.value = true
   //判断队列是否存在（判断来源对不对）
    if (!aiStore.plans.includes(queueId.value)){ 
        router.push('/')
        return showFailToast('未知方案，请重试~')
    }

    try {
        //创造一个控制器
        const controller = aiStore.createController(queueId.value)
        isLoading.value = true
        msg.value = ''
        const res = await getPlan(formData, controller?.signal)
        if (res.data && res.data.planData) {
            plan_id.value = res.data.plan_id
            planData.value = res.data.planData
        }

    } catch (err) {
        // 主动取消时不显示错误
        if (err instanceof DOMException && err.name === 'AbortError') {
            return
        }
        if (typeof err === 'string') {
            msg.value = err
        }
        else if (err instanceof Error) {
            msg.value = err.message
        } else {
            msg.value = '获取规划方案失败，请检查网络连接'
        }
    } finally {
        //成功与否都删除控制器和移出队列
        aiStore.removePlan(queueId.value)
        aiStore.removeController(queueId.value)
        isLoading.value = false
        planLoading.value = false
    }
}


const goBack = () => {
    if (isLoading.value)
        showToast({
            message: '方案未生成完全，稍后可在【历史记录】查看',
            duration: 2000
        })
    router.back()
}
//咨询AI
const goChat = () => {
    router.push({
        name: 'chat',
        query: {
            city: planData.value.city,
            scene: 'detail'
        }
    })
}

//方案的id
const plan_id = ref<number>(0)
//方案详情
const plan_detail = reactive<getDetailRes>({
    plan_id: 0,
    title: '',
    create_time: 0,
    content: planData.value,
    is_collected: false,
})
//获取方案详情
const getDetail = async () => {
    //判断是否正在加载中
    if (planLoading.value) return showFailToast('请稍后再试')
    planLoading.value = true
    try {
        const res = await planDetail(plan_id.value)
        if (res.data) {
            plan_detail.plan_id = res.data.plan_id
            plan_detail.title = res.data.title
            plan_detail.create_time = res.data.create_time
            plan_detail.content = res.data.content
            plan_detail.is_collected = res.data.is_collected
            console.log('方案详情', plan_detail)
            //先把旧标题保存
            oldTitle.value = plan_detail.title
        }
    } catch (err) {
        if (typeof err === 'string') {
            msg.value = err
        }
        else if (err instanceof Error) {
            msg.value = err.message
        } else {
            msg.value = '获取方案详情失败，请检查网络连接'
        }
    } finally {
        planLoading.value = false
    }
}

//更改了收藏状态刷新页面
const update = async (val: boolean) => {
    //更新收藏状态
    plan_detail.is_collected = val
    planData.value.is_collected = val
}

//原标题
const oldTitle = ref<string>('')
//修改标题的状态
const isEdit = ref<boolean>(false)
//修改标题是否确认
const isEditOk = ref<boolean>(true)
//是否预览标题
const isPreview = ref<boolean>(false)
//修改方案标题
const changeTitle = () => {
    //开始编辑
    isEdit.value = true
    //编辑还没好
    isEditOk.value = false
    //没有预览
    isPreview.value = false
}
//取消修改
const handleClose = () => {
    //结束编辑
    isEdit.value = false
    //编辑好了
    isEditOk.value = true
    //没有预览
    isPreview.value = false
    //复原标题
    plan_detail.title = oldTitle.value
}
//预览标题
const preview = () => {
    //结束编辑
    isEdit.value = false
    //开始预览
    isPreview.value = true
    //没有编辑好
    isEditOk.value = false
}
//确定修改
const handlePassed = async () => {
    //结束编辑
    isEdit.value = false
    //编辑好了
    isEditOk.value = true
    //没有预览
    isPreview.value = false
    //如果标题一样就直接返回
    if (plan_detail.title === oldTitle.value) return
    //校验标题
    const validTitleResult = validateTitle(plan_detail.title)
    if (validTitleResult !== true) return showToast(validTitleResult)

    try {
        const res = await changePlanTitle({ plan_id: plan_id.value, title: plan_detail.title })
        console.log(res)
        if (res.data) {
            showToast('修改标题成功')
            plan_detail.title = res.data.newTitle
        }
    } catch (err) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast('修改标题失败，请检查网络连接')
        }
        //复原标题
        plan_detail.title = oldTitle.value
    }


}
onMounted(() => {
    //来源
    origin.value = route.query.origin as string
    //请求参数
    formData.city = route.query.city as string
    formData.budget = Number(route.query.budget)
    formData.days = Number(route.query.days)
    //方案id
    plan_id.value = Number(route.query.plan_id)
    //队列id
    queueId.value = route.query.queueId as string
    if (queueId.value && formData.city && formData.budget && formData.days && origin.value === 'home') {
        getTravelPlan()
    }
    else if (plan_id.value && origin.value === 'history') {
        getDetail()
    } else {
        msg.value = '参数不完整或有误，请返回重试'
    }
})
</script>

<style scoped lang="scss">
.page-header {
    :deep() {
        --van-nav-bar-height: 60px;
    }

    height: 60px;
    font-size: 20px
}

.page-content {
    padding: 12px;
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
</style>