<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed left-arrow @click-left="router.back()" title="历史记录">
            </van-nav-bar>
        </div>
        <div class="page-content">
            <PlanList :list="historyList" @refresh="getHistoryList" origin="history" :loading="loading"
                :hasMore="hasMore" :error="error"></PlanList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getHistoryPlan } from '@/api/travel';
import { showToast } from 'vant'
import type { getHistoryPlanRes } from '@/interfaces/travel'

const router = useRouter()
const historyList = ref<getHistoryPlanRes['planResult']>([])
//下一个游标
const nextCursor = ref<number | null>(null)
//是否还有更多数据
const hasMore = ref<boolean>(true)
//是否在加载
const loading = ref<boolean>(false)
//是否出错
const error = ref<boolean>(false)
const getHistoryList = async () => {
    if (loading.value) return
    loading.value = true
    error.value = false
    try {
        const res = await getHistoryPlan(10, nextCursor.value)
        if (res.data) {
            historyList.value =[...historyList.value, ...res.data.planResult]
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
        }, 1000)
    }
}

onMounted(() => {
    getHistoryList()
})
</script>

<style scoped lang="scss">
.page-header {
    height: 46px;
}
</style>