<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="分享列表" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content">
            <PlanList :list="standardList" @refresh="getSharedPlanList" origin="share" :loading="loading"
                :hasMore="hasMore" :error="error"></PlanList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { sharedPlan } from '@/api/travel'
import { showToast } from 'vant'
import type { getSharedPlanRes, StandardPlanItem } from '@/interfaces/travel'
import { useRouter } from 'vue-router';
import { filterPlanList,normalizePlanList } from '@/utils/planFilter';
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
const getSharedPlanList = async (isRefresh: boolean) => {
    if (loading.value) return
    loading.value = true
    error.value = false
    if(isRefresh){
        sharedPlanList.value = []
        nextCursor.value=null
    }
    try {
        const res = await sharedPlan(6, nextCursor.value)
        if (res.data) {
            sharedPlanList.value =[...sharedPlanList.value, ...res.data.sharedPlanList]
            console.log(sharedPlanList.value)
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

//整理数据
const standardList=computed<StandardPlanItem[]>(()=>{
    const filterList=filterPlanList(sharedPlanList.value)
    return normalizePlanList(filterList)
})

onMounted(() => {
    getSharedPlanList(true)
})
</script>

<style scoped lang="scss">
.page-header {
    height: 46px;
}
</style>
