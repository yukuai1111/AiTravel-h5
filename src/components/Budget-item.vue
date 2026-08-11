<template>
    <div class="budget-item">
        <van-cell :border="false" v-for="(name, index) in BudgetName" :key="index" :title="name"
            :value="'￥' + budgetValue[index]" />
        <van-cell size="large" class="budget-total" title="总计" :value="'￥' + total"/>
    </div>

</template>

<script setup lang="ts">
import {computed} from 'vue'
const props = defineProps({
    budgetValue: {
        type: Object,
        default: () => {
            return {
                accommodation: 0,
                food: 0,
                tickets: 0,
                transportation: 0,
                other: 0,
            }
        }
    }
})
const total=computed(()=>{
    if(props.budgetValue){
        return props.budgetValue.accommodation + props.budgetValue.food + props.budgetValue.tickets + props.budgetValue.transportation + props.budgetValue.other
    }
    return '暂无预算'
})
const BudgetName: { [key: string]: string } = {
    accommodation: '住宿',
    food: '餐饮',
    transportation: '交通',
    tickets: '门票',
    other: '其他'
}
</script>

<style scoped lang="scss">
.budget-item {
    padding: 8px;
    margin-top: 10px;
    .budget-total {
        margin-top: 10px;
        border-radius: 8px;
        padding:12px;
        font-weight: bold;
        font-size:18px;
        :deep() {
            --van-cell-background: #f7f8fa;
            --van-cell-value-color: #ee0a24;

        }
    }
}
</style>