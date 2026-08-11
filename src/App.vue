<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const active = ref(0)
//引入全局状态管理，定义登录弹窗状态
import { useGlobalStore } from '@/stores/globalStore'
const globalStore = useGlobalStore()
const showLogin = computed({
  //获取登录弹窗状态
  get() {
    return globalStore.showLogin
  },
  //设置登录弹窗状态
  set(value) {
    globalStore.showLogin = value
  }
})
</script>

<template>
  <!-- 创建路由出口 -->
  <div class="app-container">
    <router-view></router-view>
    <van-tabbar v-model="active" route v-if="['/home', '/chat', '/profile'].includes(route.path)">
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/chat">对话</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 全局设置登录弹窗 -->
    <LoginPopup :showLogin="showLogin" @close="showLogin = false" />
  </div>

</template>
