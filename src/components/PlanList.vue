<template>
    <div class="list-content">

        <van-empty v-if="props.list.length === 0"
            :description="props.origin === 'collect' ? '暂无收藏方案，快去收藏一个吧~' : props.origin === 'share' ? '暂无分享方案，快去分享一个吧~' : '暂无方案，快去生成一个吧~'" />
        <van-list v-else @load="onBottom" offset="10" :loading="props.loading" loading-text="加载中..."
            :finished="!props.hasMore" finished-text="没有更多了" :error="props.error" error-text="加载出错，请重试">
            <van-swipe-cell class="swiper-card" v-for="plan in props.list"
                :key="props.origin === 'history' ? plan.plan_id : plan.collection_id">
                <div class="card-item" @click="toDetail(plan.plan_id)">
                    <div class="card-icon">
                        <van-icon v-if="props.origin !== 'share'" name="orders-o" size="28" />
                        <van-icon v-else name="todo-list-o" size="28" />
                    </div>
                    <div class="card-content">
                        <!-- 历史/收藏方案 -->
                        <div v-if="props.origin !== 'share'" style="padding:10px">
                            <div class="title">{{ plan.title }}</div>
                            <div v-if="props.origin === 'history'" class="time">
                                生成时间：{{ dayjs(plan.create_time).format('YYYY-MM-DD HH:mm') }}
                            </div>
                            <div v-else style="display: flex; flex-direction: column;">
                                <div class="time">
                                    生成时间：{{ dayjs(plan.plan_time).format('YYYY-MM-DD HH:mm') }}
                                </div>
                                <div v-if="props.origin === 'collect'" class="time">收藏时间：{{
                                    dayjs(plan.collect_time).format('YYYY-MM-DD HH:mm') }}
                                </div>
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
                                    分享时间：{{ dayjs(plan.share_time).format('YYYY-MM-DD HH:mm') }}
                                    分享码：{{ plan.code }}
                                    <van-icon @click.stop="cancelShare(plan.code!)" style="font-weight: 600;"
                                        v-if="plan.share_is_cancel === 1 && plan.timeText && plan.timeText !== '已失效'"
                                        name="revoke" size="18" />
                                </div>
                            </template>
                            <template #value>
                                <van-loading type="spinner" v-if="!plan.timeText" size="26" />
                                <div v-else>
                                    <div v-if="plan.share_is_cancel === 0"
                                        style="font-weight: 600;width:70px;color: #868686; font-size: 15px;">
                                        已失效
                                    </div>
                                    <div v-else style="font-weight:600;width:70px;font-size: 14px;"
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
                            @click="handleDelete(plan.plan_id)"><van-icon name="delete-o" size="24" /></van-button>
                        <van-button class="share-button" @click="handleShare(plan.plan_id)"><van-icon name="share-o"
                                size="24" /></van-button>
                    </div>
                </template>
            </van-swipe-cell>
        </van-list>

        <!-- 分享链接的弹窗 -->
        <van-popup class="sharePopup" closeable :close-on-click-overlay="false" v-model:show="showSharePopup">
            <div class="title">分享链接</div>
            <div class="tip">生成链接成功，可以分享给好友看啦~</div>
            <van-field :border="false" size="large" class="url_field" rows="2" type="textarea" v-model="share_url"
                readonly />
            <van-button type="primary" block @click="copyLink" style="margin-top:10px">
                复制链接
            </van-button>
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { deletePlan, sharePlan, cancelSharePlan, deleteSharedPlan } from '@/api/travel'
import dayjs from 'dayjs'
import { showConfirmDialog, showToast } from 'vant'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { countDown } from '@/utils/countDown'
const router = useRouter()
const props = defineProps({
    list: {
        type: Array as () => {
            plan_id: number,
            title: string,
            create_time?: number,
            collection_id?: number,
            collect_time?: number,
            plan_time?: number,
            share_id?: number,
            share_expire_time: number,
            code?: string,
            share_is_cancel?: number,
            plan_create_time?: number,
            share_time?: number,
            timeText?: string,  //记录倒计时的文本
        }[],
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
const emit = defineEmits(['refresh'])
//删除计划
const handleDelete = (plan_id: number) => {
    showConfirmDialog({
        title: '确认删除吗？',
        message: '删除后将无法恢复',
    }).then(async () => {
        try {
            await deletePlan(plan_id)
            emit('refresh')
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
const share_baseurl = import.meta.env.VITE_SHARE_BASEURL
const share_url = ref<string>('')
//展示分享链接的弹窗
const showSharePopup = ref<boolean>(false)
//分享计划
const handleShare = async (plan_id: number) => {
    try {
        const res = await sharePlan(plan_id)
        if (res.data) {
            //http://127.0.0.1:5173/share?code=mskgnut91nfR
            share_url.value = `${share_baseurl}?code=${res.data.shareCode}&time=${res.data.share_time}`
            // console.log(share_url.value)
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
            emit('refresh')
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
            emit('refresh')
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
//复制链接
const copyLink = () => {
    navigator.clipboard.writeText(share_url.value)
    showToast({
        message: '复制成功,可以分享给好友看啦~',
        duration: 2000
    })
    showSharePopup.value = false
}

//查看方案详情
const toDetail = (plan_id: number) => {
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

//定时器
const timer = ref<number>(0)
//更新每一条数据的倒计时文本
const updateTimeText = () => {
    props.list.forEach(plan => {
        plan.timeText = countDown(Date.now(), plan.share_expire_time)
    })
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
})
onUnmounted(() => {
    //页面卸载时清除定时器
    clearInterval(timer.value)
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
            padding: 8px 20px;
            background: linear-gradient(135deg, #f7f9fc 0%, #eef2ff 50%, #e0e7ff 100%);


            .card-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 10px;
                gap: 9px;

                .title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }

                .time {
                    font-size: 14px;
                    color: #999;
                    margin-top: 8px;
                }
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
        margin-top: 10px
    }
}
</style>