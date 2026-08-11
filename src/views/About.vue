<template>
    <div class="about-page">
        <!-- 顶部导航 -->
        <div class="page-header">
            <van-nav-bar fixed title="关于项目" left-arrow @click-left="router.back()" />
        </div>

        <div class="content">
            <!-- 项目概览 -->
            <div class="hero">
                <div class="logo">
                    <van-icon name="guide-o" size="48" color="#1989fa" />
                </div>
                <h1>AI 旅行规划</h1>
                <p class="slogan">基于大模型的智能行程规划助手</p>
                <div class="tags">
                    <van-tag type="primary">Vue 3</van-tag>
                    <van-tag type="success">Node.js</van-tag>
                    <van-tag type="danger">GLM-4.7-Flash</van-tag>
                    <van-tag type="warning">TypeScript</van-tag>
                </div>
            </div>

            <!-- 核心功能 -->
            <van-cell-group inset title="📌 核心功能">
                <van-cell title="智能生成方案" label="多天行程 + 预算分配 + JSON 结构化输出" />
                <van-cell title="流式对话" label="SSE 实现打字机效果，实时响应" />
                <van-cell title="方案管理" label="历史记录 + 收藏 + 分享功能" />
                <van-cell title="多模型降级" label="云端模型 → 本地 Ollama" />
            </van-cell-group>

            <!-- 技术亮点 -->
            <van-cell-group inset title="🚀 技术亮点">
                <van-cell title="流式对话" label="SSE 实现逐字输出，提升用户体验" />
                <van-cell title="多模型降级" label="云端模型 →  本地 Ollama 自动切换" />
                <van-cell title="并发控制" label="方案生成最多同时 2 个，防止资源过载" />
                <van-cell title="请求取消" label="AbortController + 控制器池管理" />
                <van-cell title="游标分页" label="触底加载 ，适配移动端" />
                <van-cell title="参数校验" label="Joi 校验 + 统一业务错误处理" />
            </van-cell-group>

            <!-- 技术栈 -->
            <van-cell-group inset title="🛠️ 技术栈">
                <van-cell title="前端" value="Vue 3 + TypeScript + Vant + Pinia +Router" />
                <van-cell title="后端" value="Node.js + Express + MySQL" />
                <van-cell title="AI 模型" value="智谱 GLM-4.7-Flash  / Ollama" />
                <van-cell title="部署" value="Docker + Nginx" />
            </van-cell-group>

            <!-- 接口文档 -->
            <van-cell-group inset title="📄 接口文档（Apifox）">
                <van-cell title="工具" value="Apifox" />
                <van-cell title="接口总数" value="15+" />
                <van-cell title="覆盖模块" label="用户认证 · 方案管理 · 收藏分享" />
                <van-cell title="文档规范" label="RESTful + Joi 参数校验 + 统一响应格式" />
                <van-cell title="查看完整接口文档" is-link
                    @click="openDoc('https://s.apifox.cn/c037b8ce-67d2-44dc-8027-cf99c8de3195/496522190e0')" />
            </van-cell-group>

            <!-- 个人信息 -->
            <van-cell-group inset title="👨‍💻 开发者">
                <van-cell title="作者" value="Yukuai" />
                <van-cell title="GitHub" is-link @click="openGitHub('https://github.com/yukuai1111')" />
                <van-cell title="联系电话" value="152-6070-7029" is-link @click="makeCall" />
            </van-cell-group>

            <!-- 底部 -->
            <div class="footer">
                <p>版本 v1.0.0 · 更新于 2026-08-11</p>
                <p class="disclaimer">仅供学习交流使用 · AI 生成内容仅供参考</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const openGitHub = (url: string) => {
    window.open(url, '_blank')
}

const openDoc = (url: string) => {
    window.open(url, '_blank')
}

const makeCall = () => {
    window.open('tel:15260707029', '_blank')
}

</script>

<style scoped lang="scss">
.about-page {
    min-height: 100vh;
    background: #f5f6fa;

    .content {
        padding: 16px;
        margin-top: 46px;
    }

    .hero {
        text-align: center;
        padding: 24px 0 16px;
        background: white;
        border-radius: 12px;
        margin-bottom: 16px;

        .logo {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 8px 0 4px;
        }

        .slogan {
            color: #666;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .tags {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
    }

    .van-cell-group {
        margin-bottom: 16px;
    }

    .footer {
        text-align: center;
        padding: 20px 0 16px;
        color: #999;
        font-size: 12px;

        .disclaimer {
            color: #ccc;
            margin-top: 4px;
        }
    }
}
</style>