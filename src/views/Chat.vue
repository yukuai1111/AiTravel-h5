<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="AI旅游助手" left-arrow left-text="返回" @click-left="goBack" />
        </div>
        <div class="chat-container" @scroll="handleScroll" ref="scrollRef">
            <div class="chat-empty" v-if="!messages.length">
                <van-empty description="开始和AI助手对话吧！" />
                <div class="quickly-questions">
                    <div class="title">常见问题</div>
                    <div class="question-tgas">
                        <van-tag @click="quicklyQuestion(question)" mark size="large" color="#646566" text-color="#fff"
                            v-for="(question, index) in questions" :key="index">
                            {{ question }}
                        </van-tag>
                    </div>
                </div>
            </div>
            <div class="chat-messages" v-else>
                <div class="message-list">
                    <ChatBubble class="message-item" v-for="message in messages" :key="message.id"
                        :messages="message" />
                </div>
                <!-- 如果ai还在运行 -->
                <div class="loading-message" style="margin-left: 20px;"
                    v-if="isAIRunning && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === ''">
                    <van-loading size="24px" type="spinner">AI正在思考中...</van-loading>
                </div>
            </div>
        </div>
        <div class="chat-input">
            <van-field :disabled="isAIRunning" :border="true" v-model="inputMessage" @keyup.enter="sendMessage"
                placeholder="请输入您的问题...">
                <template #button>
                    <van-button :loading="btnLoading" @click="sendMessage" :disabled="!inputMessage.trim()" round
                        size="small" type="primary">发送</van-button>
                </template>
            </van-field>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { streamPost } from '@/utils/request'
import ChatBubble from '@/components/ChatBubble.vue'
import { requireAuth } from '@/utils/requireAuth'
import { useAIStore } from '@/stores/aiStore'
const router = useRouter()
const route = useRoute()
const aiStore = useAIStore()

//消息
const messages = ref<{ id: number, role: string, content: string, time: string }[]>([])
//输入的问题
const inputMessage = ref<string>('')
//快速问题
const questions: string[] = [
    '泉州有哪些必去的景点',
    '上海美食推荐',
    '如何选择旅行保险',
    '出行前需要注意什么'
]
//点击快速问题
const quicklyQuestion = (question: string) => {
    inputMessage.value = question
}
//发送按钮的加载
const btnLoading = ref<boolean>(false)
//AI处理的状态
const isAIRunning = ref<boolean>(false)
//聊天的控制器id
const chatId = ref<string>(`chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)

//往messages数组里添加消息
const addMessage = (role: string, content: string) => {
    messages.value.push({
        id: role === 'user' ? Date.now() : Date.now() + 1,
        role,
        content,
        time: new Date().toLocaleString()
    })
}
//实现页面滚动
const scrollRef = ref<HTMLDivElement>()
//到达底部
const isAtBottom = ref<boolean>(true)
//手动滚动页面
const handleScroll = () => {
    if (!scrollRef.value) return
    //为了改变是否是底部（这样滑动的时候不会一直被拉下去）
    //计算距离底部的距离
    const distanceBottom = scrollRef.value.scrollHeight - scrollRef.value.scrollTop - scrollRef.value.clientHeight
    //如果距离底部小于20，就认为到达底部
    isAtBottom.value = distanceBottom < 20
}
//自动滚动页面到底部
const scrollBottom = () => {
    if (!scrollRef.value) return
    nextTick(() => {
        scrollRef.value!.scrollTo({
            top: scrollRef.value!.scrollHeight - scrollRef.value!.clientHeight,
            behavior: 'smooth'
        })
    })
}
//获取ai回复
const fetchStream = async (userMsg: string) => {
    //创建控制器
    const controller = aiStore.createController(chatId.value)
    //给ai消息写一个占位符
    addMessage("ai", "")
    //总回复
    let fullResponse = ''
    //调用接口
    await streamPost('/chat',
        { message: userMsg },
        (line) => {
            //当在底部时才会自动滚动
            if (isAtBottom.value) scrollBottom()
            //不断拼接
            fullResponse += line.trim()
            //不断添加ai消息
            //获取ai占位符（总是数组的最后一个）
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage && lastMessage.role === 'ai') {
                lastMessage.content = fullResponse
            } else {
                return showToast('AI助手错乱了...')
            }
        },
        () => {
            //回复正常结束
            isAIRunning.value = false
            btnLoading.value = false
            //移除控制器
            aiStore.removeController(chatId.value)
            if (isAtBottom.value) scrollBottom()
        },
        (err) => {
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage && lastMessage.role === 'ai') {
                lastMessage.content = `抱歉，AI助手发生错误:${err}`
                showToast("AI回复失败！")
            } else {
                return showToast('AI助手错乱了...')
            }
            isAIRunning.value = false
            btnLoading.value = false
            //移除控制器
            aiStore.removeController(chatId.value)
            if (isAtBottom.value) scrollBottom()
        },
        0,
        controller.signal
    )
}
//发送消息
const sendMessage = async () => {
    //判断登陆没有
    if (!requireAuth()) return
    const userMsg = inputMessage.value.trim()
    //如果消息为空
    if (!userMsg) return showToast('请输入问题!')
    //如果ai还在运行
    if (isAIRunning.value) return showToast("AI助手还在回复哦，请耐心等待~")
    
    //判断是否正在加载中
    if (btnLoading.value) return showToast('请稍后再试')
    
    btnLoading.value = true
    isAIRunning.value = true
    //重置发送框
    inputMessage.value = ''
    //添加消息
    addMessage("user", userMsg)
    //调用接口
    fetchStream(userMsg)
}

const goBack = () => {
    router.back()
}
onMounted(() => {
    if (route.query.scene === 'detail' && route.query.city) {
        inputMessage.value = `我想了解一下${route.query.city}的旅游景点`
    }
})

onUnmounted(() => {
    // 离开聊天页时停止当前 AI 聊天流
    aiStore.removeController(chatId.value)
})
</script>

<style scoped lang="scss">
.page-container {
    .page-header {
        height: 50px;
    }

    .chat-container {
        height: calc(100vh - 150px);
        overflow-y: auto;

        .chat-empty {
            margin-top: 30%;

            .quickly-questions {
                margin-top: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                .title {
                    font-size: 16px;
                    color: #999;
                    margin-bottom: 25px;
                }

                .question-tgas {
                    width: 80%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;

                    .van-tag {
                        font-size: 16px;
                    }
                }
            }
        }

        .chat-messages {
            padding: 20px 8px 40px 8px;
        }
    }

    .chat-input {
        background-color: #fff;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px 15px 60px 15px;

        // 修改输入框背景
        :deep(.van-field) {
            background-color: #f7f8fa;
            border-radius: 20px;
        }
    }
}
</style>