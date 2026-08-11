<template>
    <div class="list">
        <div class="item" v-for="(item, index) in tipsOrWarnings" :key="index">{{ item }}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    tipsOrWarnings: {
        type: Array,
        default: () => {
            return ['暂无']
        }
    }
})
</script>

<style scoped lang="scss">
.list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10px;
    gap:15px;
    margin-top: 10px;
    .item {
        font-size:14px;
        font-weight: 500;
        color:#646566;
    }
}
</style>
