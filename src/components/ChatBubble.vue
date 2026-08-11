<template>
    <div class="chat-bubble" :class="messageClass">
        <div class="message-content">{{ messages.content }}</div>
        <div class="message-time" v-if="showTime">{{ formatTime }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const props = defineProps({
    messages: {
        type: Object,
        default: () => { },
        required: true
    }
})
const messageClass = computed(() => {
    return props.messages.role === 'user' ? "user-message" : "ai-message"
})
const showTime = computed(() => {
    return props.messages.role === 'user' || (props.messages.role === 'ai' && props.messages.content.trim() !== '')
})

const formatTime = computed(() => {
    const timeTemp= props.messages.time.split(' ')[1]
    const time=timeTemp.split(':')[0]+':'+timeTemp.split(':')[1]
    return time
})
</script>

<style scoped lang="scss">
.chat-bubble {
    padding: 2px 12px 2px 12px;
    display: flex;
    flex-direction: column;
    white-space: pre-wrap;
    word-break: break-all;

    .message-content {
        font-size: 15px;
        line-height: 24px;
    }

    .message-time {
        margin-top:8px;
        font-size: 13px;
        color: #999;
    }
}

.user-message {
    justify-content: flex-end;
    align-items: flex-end;

    .message-content {
        max-width: 80%;
        padding: 12px;
        background-color: #4080FF;
        color: #fff;
        border-radius: 15px 15px 2px 15px;
    }
}

.ai-message {
    justify-content: flex-start;
    align-items: flex-start;

    .message-content {
        max-width: 88%;
        padding: 10px;
        color: #333;
    }
}
</style>