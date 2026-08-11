<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="分享列表" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content">
            <PlanList :list="sharedPlanList" @refresh="getSharedPlanList" origin="share" :loading="loading"
                :hasMore="hasMore" :error="error"></PlanList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sharedPlan } from '@/api/travel'
import { showToast } from 'vant'
import type { getSharedPlanRes } from '@/interfaces/travel'
import { useRouter } from 'vue-router';
const router = useRouter()
const sharedPlanList = ref<getSharedPlanRes['sharedPlanList']>([])
//是否加载
const loading = ref<boolean>(false)
// 是否还有数据
const hasMore = ref<boolean>(true)
// 是否出错
const error = ref<boolean>(false)
//下一个游标
const nextCursor = ref<number | null>(null)
const getSharedPlanList = async () => {
    if (loading.value) return
    loading.value = true
    error.value = false
    try {
        const res = await sharedPlan()
        if (res.data) {
            sharedPlanList.value = res.data.sharedPlanList
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
    getSharedPlanList()
})
</script>

<style scoped lang="scss">
.page-header {
    height: 46px;
}
</style>
