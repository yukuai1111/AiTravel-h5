<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed left-arrow @click-left="router.back()" title="历史记录">
            </van-nav-bar>
        </div>
        <div class="page-content">
            <PlanList :list="standardList" @refresh="getHistoryList" origin="history" :loading="loading"
                :hasMore="hasMore" :error="error"></PlanList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { getHistoryPlan } from '@/api/travel';
import { showToast } from 'vant'
import type { getHistoryPlanRes, StandardPlanItem } from '@/interfaces/travel'
import { filterPlanList, normalizePlanList } from '@/utils/planFilter'

const router = useRouter()
//原始的历史数据
const historyList = ref<getHistoryPlanRes['planResult']>([])
//下一个游标
const nextCursor = ref<number | null>(null)
//是否还有更多数据
const hasMore = ref<boolean>(true)
//是否在加载
const loading = ref<boolean>(false)
//是否出错
const error = ref<boolean>(false)

const getHistoryList = async (isRefresh: boolean) => {
    if (loading.value) return
    loading.value = true
    error.value = false
    if(isRefresh){
        historyList.value = []
        nextCursor.value = null
        hasMore.value = true
    }
    try {
        const res = await getHistoryPlan(8, nextCursor.value)
        if (res.data) {
            historyList.value = [...historyList.value, ...res.data.planResult]
            nextCursor.value = res.data.nextCursor
            hasMore.value = res.data.hasMore
        }
    } catch (err: unknown) {
        error.value = true
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    } finally {
        //定时器
        setTimeout(() => {
            //通知父组件再次获取数据
            loading.value = false
        }, 1900)
    }
}


//把原始数据进行处理
const standardList = computed<StandardPlanItem[]>(() => {
    //先过滤不要的数据
    const filterList = filterPlanList(historyList.value)
    //在标准化数据
    return normalizePlanList(filterList)
})
onMounted(() => {
    getHistoryList(true)
})
</script>

<style scoped lang="scss">
.page-header {
    height: 46px;
}
</style>