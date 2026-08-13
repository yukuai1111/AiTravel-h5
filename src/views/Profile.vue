<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="我的" left-arrow @click-left="router.back()" />
        </div>
        <div class="page-content" v-if="userStore.isLogin && userStore.userInfo">
            <div class="user-info">
                <div class="user-avatar">
                    <van-skeleton v-if="!userStore.userInfo.avatar" avatar avatar-size="6rem" style="margin-right: -40px;margin-left:-10px" />
                    <van-image round width="6rem" height="6rem" v-else
                        :src="`${baseURL}${userStore.userInfo.avatar}`" />
                </div>
                <div class="user-data">
                    <div class="user-name">{{ userStore.userInfo.username }}</div>
                    <div class="hello">欢迎使用智能旅游助手</div>
                </div>
            </div>
            <div class="list">
                <div class="serve-list">
                    <van-cell-group title="我的服务" class="serve-title">
                        <van-cell title="⭐我的收藏" is-link to="/my/collect" />
                        <van-cell title="历史记录" is-link to="/my/history" />
                        <van-cell title="设置" is-link to="/my/options" />
                    </van-cell-group>
                </div>
                <div class="aboout-list">
                    <van-cell-group title="关于" class="serve-title">
                        <van-cell title="关于我们" is-link to="/my/about" />
                        <van-cell title="版本信息" value="v1.0.2" />
                    </van-cell-group>
                </div>
            </div>
        </div>
        <div v-else class="empty-login">
            <van-empty description="登录后查看个人中心">
                <van-button type="primary" round @click="globalStore.showLogin = true">
                    立即登录
                </van-button>
            </van-empty>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { requireAuth } from '@/utils/requireAuth'
import { useGlobalStore } from '@/stores/globalStore'
import { useUserStore } from '@/stores/userStore'
const globalStore = useGlobalStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
//获取图片基础地址
const baseURL = import.meta.env.VITE_IMG_BASEURL
onMounted(async () => {
    const msg = route.query.msg as string
    if (!requireAuth(msg)) return
    //如果登录了，就从userStore里获取用户信息

})
</script>

<style scoped lang="scss">
.page-container {
    background-color: #fff;
    position: relative;

    .page-content {
        margin-top: 46px;

        .user-info {
            padding: 25px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

            .user-data {
                margin-left: 20px;
                flex: 1;

                .user-name {
                    font-weight: bold;
                    font-size: 18px;
                    color: #fff;
                    margin-bottom: 8px
                }

                .hello {
                    font-size: 14px;
                    color: #fff
                }
            }
        }

        .list {
            padding: 15px;

            :deep(.van-cell-group__title) {
                color: #969799;
                font-weight: bold;
                font-size: 15px;
            }

            :deep(.van-cell__title) {
                font-size: 15px;
                color: #323233;
            }

            .serve-list {
                margin-bottom: 25px;
            }
        }
    }

    .change-avatar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 18%;
        padding: 20px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
}
</style>