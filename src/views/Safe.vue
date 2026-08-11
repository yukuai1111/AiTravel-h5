<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed left-arrow @click-left="router.back()" title="账号安全" />
        </div>
        <div class="page-content">
            <van-cell title="旅行密码" @click="changePsd" center is-link size="large" value="已设置" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter()
const changePsd = () => {
    router.push({
        name: 'resetPsd'
    })
}
</script>

<style scoped lang="scss">
.page-container {
    .page-header {
        height: 46px;
    }
}
</style>