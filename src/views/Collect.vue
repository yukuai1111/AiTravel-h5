<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed left-arrow @click-left="router.back()" title="我的收藏">
            </van-nav-bar>
        </div>
        <div class="page-content">
            <PlanList :list="collectList" @refresh="getCollectPlanList" origin="collect" :loading="loading"
                :hasMore="hasMore" :error="error"></PlanList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { getCollectPlan } from '@/api/travel';
import { showToast } from 'vant'
import type { getCollectPlanRes } from '@/interfaces/travel'
const router = useRouter()
const collectList = ref<getCollectPlanRes['collectPlan']>([])
//是否加载
const loading = ref<boolean>(false)
// 是否还有数据
const hasMore = ref<boolean>(true)
// 是否出错
const error = ref<boolean>(false)
//下一个游标
const nextCursor = ref<number | null>(null)
const getCollectPlanList = async () => {
    if (loading.value) return
    loading.value = true
    error.value = false
    try {
        const res = await getCollectPlan()
        if (res.data) {
            collectList.value =[...collectList.value, ...res.data.collectPlan]
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
    getCollectPlanList()
})
</script>

<style scoped lang="scss">
.page-header {
    height: 46px;
}
</style>
