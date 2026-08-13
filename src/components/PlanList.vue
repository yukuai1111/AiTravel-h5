<template>
    <div class="list-content">

        <van-empty v-if="props.list.length === 0"
            :description="props.origin === 'collect' ? '暂无收藏方案，快去收藏一个吧~' : props.origin === 'share' ? '暂无分享方案，快去分享一个吧~' : '暂无方案，快去生成一个吧~'" />
        <van-list v-else @load="onBottom" offset="10" :loading="props.loading" loading-text="加载中..."
            :finished="!props.hasMore" finished-text="没有更多了" :error="props.error" error-text="加载出错，请重试">
            <van-swipe-cell class="swiper-card" v-for="plan in renderList" :key="plan.itemKey">
                <div class="card-item" @click="toDetail(plan.planId, plan.state)"
                    :class="{ 'fail': plan.state === 'fail', 'pending': plan.state === 'pending' }">
                    <div class="card-icon">
                        <van-icon v-if="props.origin !== 'share'" name="orders-o" size="28" />
                        <van-icon v-else name="todo-list-o" size="28" />
                    </div>
                    <div class="card-content">
                        <!-- 历史/收藏方案 -->
                        <div v-if="props.origin !== 'share'" style="padding:10px">
                            <div class="title">{{ plan.title }}</div>
                            <div class="time" v-if="plan.state === 'success'">
                                生成时间：{{ dayjs(plan.generateTime).format('YYYY-MM-DD HH:mm') }}
                            </div>
                            <div class="time" v-if="plan.state === 'fail'">
                                失败原因：{{ plan.failReason }}
                            </div>
                            <div class="time" v-if="plan.state === 'pending'">
                                待生成...
                            </div>
                            <div v-if="props.origin === 'collect'" class="time">收藏时间：{{
                                dayjs(plan.collectTime).format('YYYY-MM-DD HH:mm') }}
                            </div>
                        </div>
                        <!-- 分享方案 -->
                        <van-cell center v-else style="background-color: transparent;" :border="false">
                            <template #title>
                                <div class="title" style="width: 190px;">
                                    {{ formatTitle(plan.title) }}
                                    <van-icon name="delete-o" size="22" @click.stop="deleteShared(plan.code!)" />
                                </div>
                                <div class="time">
                                    分享时间：{{ dayjs(plan.shareTime).format('YYYY-MM-DD HH:mm') }}
                                    分享码：{{ plan.code }}
                                    <van-icon @click.stop="cancelShare(plan.code!)" style="font-weight: 600;"
                                        v-if="!plan.isShareCancel && plan.timeText && plan.timeText !== '已失效'"
                                        name="revoke" size="18" />
                                </div>
                            </template>
                            <template #value>
                                <van-loading type="spinner" v-if="!plan.timeText" size="26" />
                                <div v-else>
                                    <div v-if="plan.isShareCancel"
                                        style="font-weight: 600;color: #868686; font-size: 14px;">
                                        已失效
                                    </div>
                                    <div v-else
                                        style="font-weight:600;width:100%;flex-shrink:0;text-align: right;font-size: 14px;"
                                        :style="{ color: plan.timeText === '已失效' ? '#868686' : '#d1a958', fontSize: plan.timeText === '已失效' ? '15px' : '14px' }">
                                        {{ plan.timeText }}
                                    </div>
                                </div>
                            </template>
                        </van-cell>
                    </div>
                </div>
                <template #right v-if="props.origin !== 'share'">
                    <div class="button-container">
                        <van-button class="delete-button" v-if="props.origin === 'history'"
                            @click="handleDelete(plan.planId)"><van-icon name="delete-o" size="24" /></van-button>
                        <van-button v-if="plan.state === 'success'" class="share-button"
                            @click="handleShare(plan.planId)"><van-icon name="share-o" size="24" /></van-button>
                    </div>
                </template>
            </van-swipe-cell>
        </van-list>

        <!-- 分享链接的弹窗 -->
        <van-popup class="sharePopup" closeable :close-on-click-overlay="false" v-model:show="showSharePopup">
            <div class="title">分享链接</div>
            <div class="tip">生成链接成功，可以分享给好友看啦~</div>
            <van-field :border="false" size="large" class="url_field" rows="4" type="textarea" v-model="share_url"
                readonly />
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { deletePlan, sharePlan, cancelSharePlan, deleteSharedPlan, getPlan } from '@/api/travel'
import dayjs from 'dayjs'
import { showConfirmDialog, showToast, showFailToast } from 'vant'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { countDown } from '@/utils/countDown'
import type { StandardPlanItem } from '@/interfaces/travel'
import { useAIStore } from '@/stores/aiStore'
const aiStore = useAIStore()
const router = useRouter()
const props = defineProps({
    list: {
        type: Array as () => StandardPlanItem[],
        default: () => []
    },
    origin: {
        type: String,
        default: ''
    },
    loading: {
        type: Boolean,
        default: false
    },
    hasMore: {
        type: Boolean,
        default: true
    },
    error: {
        type: Boolean,
        default: false
    }
})
//先把分享的数据复制一份
const localShareList = ref<StandardPlanItem[]>([])
//用于遍历的数组（为了区分分享）
const renderList = computed(() => {
    return props.origin === 'share' ? localShareList.value : props.list
})
const emit = defineEmits(['refresh'])
//删除计划
const handleDelete = (plan_id: number) => {
    showConfirmDialog({
        title: '确认删除吗？',
        message: '删除后将无法恢复',
    }).then(async () => {
        try {
            //如果是生成中，就先删除队列/请求
            const plan = renderList.value.find(item => item.planId === plan_id)
            console.log('plan', plan)
            if (plan && plan.state === 'pending' && plan.queue_id) {
                aiStore.removePlan(plan.queue_id)
                aiStore.removeController(plan.queue_id)
            }
            //再去删除数据库
            await deletePlan(plan_id)
            emit('refresh', true)
            showToast('删除成功')
        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        }
    }).catch(() => {
        showToast('已取消删除')
    })
}
//分享的链接
const share_url = ref<string>('')
//展示分享链接的弹窗
const showSharePopup = ref<boolean>(false)
//分享计划
const handleShare = async (plan_id: number) => {
    try {
        const res = await sharePlan(plan_id)
        if (res.data) {
            const domain = window.location.origin
            const basePath = import.meta.env.BASE_URL
            //http://127.0.0.1:5173/share?code=mskgnut91nfR
            share_url.value = `${domain}${basePath}sharePage?code=${res.data.shareCode}&time=${res.data.share_time}`
            console.log(share_url.value)
            showSharePopup.value = true
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    }
}

//取消分享
const cancelShare = async (code: string) => {
    showConfirmDialog({
        title: '确认取消分享吗？',
        message: '取消分享后将无法恢复',
    }).then(async () => {
        try {
            await cancelSharePlan(code)
            showToast('取消分享成功')
            emit('refresh', true)
        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        }
    }).catch(() => {
        showToast('已取消')
    })
}
//删除分享方案列表
const deleteShared = async (code: string) => {
    showConfirmDialog({
        title: '确认删除吗？',
        message: '删除后将无法恢复',
    }).then(async () => {
        try {
            await deleteSharedPlan(code)
            showToast('删除成功')
            emit('refresh', true)
        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        }
    }).catch(() => {
        showToast('已取消删除')
    })
}

//复制成功
const copySuccess = () => {
    const selection = window.getSelection()?.toString() || ''
    if (!selection) return
    if (selection.trim() === share_url.value) {
        showToast('复制成功')
        showSharePopup.value = false
    } else {
        showToast('复制完整链接，才能分享给好友看哦~')
    }
}

//重试方案的加载
const loadingMap = ref<Map<number, boolean>>(new Map())
//查看方案详情
const toDetail = async (plan_id: number, state: string) => {
    if (loadingMap.value.get(plan_id) === true) return
    loadingMap.value.set(plan_id, true)
    if (state === 'pending') {
        loadingMap.value.set(plan_id, false)
        showToast('方案生产中，请耐心等待~')
        return
    }
    if (state === 'fail') {
        //找到要重试的方案，修改状态
        const plan = renderList.value.find(item => item.planId === plan_id)
        if (!plan) {
            loadingMap.value.set(plan_id, false)
            return showToast('方案不存在')
        }
        //加入队列
        plan.queue_id = `retry_${plan_id}_${Date.now()}`
        //判断是否方案队列已满
        if (!aiStore.addPlan(plan.queue_id)) return showFailToast('最多只能生成2个方案哦，请耐心等待~')
        //创建控制器
        const controller = aiStore.createController(plan.queue_id)
        plan.state = 'pending'
        showToast('重试中，请耐心等待~')
        try {
            const res = await getPlan({ retry: true, retry_id: plan_id, queue_id: plan.queue_id }, controller.signal)
            emit('refresh', true)
            if (res.data && res.data.retry_id) {
                //再次失败
                plan.state = 'fail'
                plan.failReason = res.data.failReason || '重试失败，请稍后重试~'
                emit('refresh', true)
                showToast(res.data.failReason || '重试失败，请稍后重试~')
            } else {
                //重试成功
                plan.state = 'success'
                router.push({
                    name: 'detail',
                    query: {
                        plan_id,
                        origin: 'history'
                    }
                })
                showToast(res.data?.planData.city + '-' + res.data?.planData.days + '日旅游方案-预算' + res.data?.planData.totalBudget + ' 重试成功')
            }
        } catch (err) {
            // 主动取消时不显示错误
            if (err instanceof DOMException && err.name === 'AbortError') {
                return
            }
            else if (err instanceof Error) {
                showToast(err.message)
            } else {
                showToast(err as string)
            }
        } finally {
            loadingMap.value.set(plan_id, false)
            //删除队列/请求
            aiStore.removePlan(plan.queue_id)
            aiStore.removeController(plan.queue_id)
        }
        return
    }
    router.push({
        name: 'detail',
        query: {
            plan_id,
            origin: 'history'
        }
    })
}

//整理分享的标题
const formatTitle = (title: string) => {
    const titles = title.split('-')
    return titles[0] + '-' + titles[1]
}

//实现倒计时
//监听分享数据的变化
watch(() => props.list, (newVal) => {
    if (props.origin === 'share') {
        //一有新数据就复制
        localShareList.value = newVal.map(item => {
            return { ...item }
        }
        )
    }
}, { deep: true, immediate: true })
//定时器
const timer = ref<number>(0)
//更新每一条数据的倒计时文本
const updateTimeText = () => {
    if (props.origin === 'share') {
        localShareList.value.forEach(plan => {
            plan.timeText = countDown(Date.now(), plan.shareExpireTime!)
        })
    }
}

//触底
const onBottom = () => {
    //通知父组件再次获取数据
    emit('refresh')
}

onMounted(() => {
    //页面挂载就要更新一次文本
    updateTimeText()
    //之后每一秒执行一次
    timer.value = setInterval(updateTimeText, 1000)

    //挂载复制监听事件
    document.addEventListener('copy', copySuccess)
})
onUnmounted(() => {
    //页面卸载时清除定时器
    clearInterval(timer.value)
    //移除复制监听事件
    document.removeEventListener('copy', copySuccess)
})
</script>

<style scoped lang="scss">
.list-content {


    .swiper-card {
        margin: 12px 16px;
        border-radius: 10px;
        overflow: hidden;

        .card-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #f0f4f9;
            border-radius: 8px;
            margin-bottom: 8px;
            position: relative;
            overflow: hidden;

            &::before {
                content: "";
                width: 4px;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                background: #4096ff;
            }

            &.pending {
                background: #c7d1df;

                &::before {
                    display: none;

                }
            }

            &.fail {
                background: #e7e9ec;
                opacity: 0.8;

                &::before {
                    display: none;
                }
            }

            .card-icon {
                margin-right: 10px;
            }

            .title {
                font-size: 16px;
                font-weight: 500;
            }

            .time {
                font-size: 13px;
                color: #666;
                margin-top: 4px;
            }
        }


        .button-container {
            display: flex;
            height: 100%;
            gap: 10px;
            justify-content: center;
            align-items: center;
            margin-left: 10px;

            .delete-button {
                height: 80%;
                background: #dc2626;
                color: #fff;
                border: none;
                font-size: 18px;
            }

            .share-button {
                height: 80%;
                background: #3b82f6;
                color: #fff;
                border: none;
                font-size: 18px;
            }
        }
    }

    &:last-child {
        padding-bottom: 10px;
    }
}

.sharePopup {
    max-width: 420px;
    padding: 30px 50px;

    .title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }

    .tip {
        margin-top: 10px;
        font-size: 15px;
        color: #999;
    }

    .url_field {
        font-size: 14px;
        padding: 10px;
        margin-top: 10px;
        width: 100%;
    }
}
</style>