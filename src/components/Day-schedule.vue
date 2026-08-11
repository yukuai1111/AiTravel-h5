<template>
    <div class="schedule-item">
        <div class="schedule-item-tag">
            <van-tag size="large" :text-color="props.timeTextColor" :color="props.timeBgColor">{{ props.timeText
                }}</van-tag>
        </div>
        <div class="schedule-item-title">
            <Session-title :title="timeData.spot" />
        </div>
        <div class="schedule-item-content">
            <div>
                <van-icon name="clock-o" />
                时间：{{ timeData.duration }}
            </div>
            <div>
                <van-icon name="cash-o" />
                票价：{{ timeData.ticket }}
            </div>
            <div>
                <van-icon name="logistics" />
                {{ timeData.transportation }}
            </div>
            <div>
                {{ timeData.description }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    timeData: {
        type: Object,
        default: () => {
            return {
                spot: '',
                duration: '',
                ticket: '',
                transportation: '',
                description: '',
            }
        }
    },
    timeText: {
        type: String,
        default: ''
    },
    timeBgColor: {
        type: String,
        default: '#f3f4f6'
    },
    timeTextColor: {
        type: String,
        default: '#6b7280'
    }
})
</script>

<style scoped lang="scss">
.schedule-item {
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 20px;

    .schedule-item-tag {
        margin-bottom: 10px;
    }

    .schedule-item-title {
        margin-bottom: 10px;
    }

    .schedule-item-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
    }
}
</style>
