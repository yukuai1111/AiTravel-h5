<template>
    <div class="session-title" :class="{ 'flex-between': isBudget }">
        <div class="title">
            <span class="text-left">{{ title }}</span>
            <van-icon v-if="!props.isCollected && props.topTitle" style="margin-left:15px" name="star-o" size="25"
                @click="collect" />
            <van-icon v-else-if="props.isCollected&&props.topTitle" style="margin-left:15px" name="star" size="25" @click="cancelCollect" />
        </div>
        <div v-if="props.isBudget" class="budget">
            <span class="text-right">预算：￥{{ props.budget }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { collectPlan, cancelCollectPlan } from '@/api/travel'
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    isBudget: {
        type: Boolean,
        default: false
    },
    budget: {
        type: Number,
        default: undefined
    },
    topTitle: {
        type: Boolean,
        default: false
    },
    plan_id: {
        type: Number,
        default: undefined
    },
    isCollected: {
        type: Boolean,
        default: false
    }
})
//收藏状态改变时触发
const emit = defineEmits(['changeCollect'])
//收藏方案
const collect = async () => {
    try {
        if (props.plan_id) { 
            await collectPlan(props.plan_id)
             showToast('收藏成功')
            //更新父组件修改收藏状态
            emit('changeCollect', true)
        }
    } catch (err) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    }
}
//取消收藏方案
const cancelCollect = async () => {
     try {
        if (props.plan_id) {
            await cancelCollectPlan(props.plan_id)
             showToast('取消收藏成功')
            //更新父组件修改收藏状态
            emit('changeCollect', false)
        }
    } catch (err) {
        if (err instanceof Error) {
            showToast(err.message)
        } else {
            showToast(err as string)
        }
    }
}
</script>

<style scoped lang="scss">
.session-title {
    .title {
        span {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
    }

    .budget {
        span {
            font-size: 15px;
            font-weight: 700;
            color: #e53e3e;
        }
    }
}
</style>