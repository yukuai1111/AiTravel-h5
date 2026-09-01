<template>
    <div class="page-container">
        <div class="page-header">
            <van-nav-bar fixed title="智能旅游助手" />
        </div>
        <div class="page-content">
            <van-notice-bar left-icon="info-o" text="基于 AI 的智能景点介绍与行程规划系统" style="margin-bottom: 16px;" />
            <!-- 规划行程 -->
            <div class="card search-card">
                <Session-title title="规划你的旅程" />
                <div class="search-form">
                    <van-field class="form-item" readonly is-link v-model="formData.city" label="目的地"
                        placeholder="请选择计划目的城市" @click="showCityPicker = true" :border="false" />
                    <van-field class="form-item" type="number" :border="false" v-model="formData.budget" label="预算（元）"
                        placeholder="请输入预算金额" />
                    <van-field class="form-item" type="digit" :border="false" v-model="formData.days" label="天数"
                        placeholder="请输入旅行天数" />
                    <van-button type="primary" block size="large" round @click="handlePlan" :loading="planLoading"
                        :disabled="!formData.city || !formData.budget || !formData.days">开始规划</van-button>
                </div>
            </div>
            <!-- 快捷入口 -->
            <div class="card fastentry-card">
                <Session-title title="快捷入口" />
                <div class="fastentry-list">
                    <van-grid clickable :column-num="2" :gutter="12">
                        <van-grid-item icon="chat-o" text="AI对话" to="/chat" />
                        <van-grid-item icon="user-o" text="我的" to="/profile" />
                    </van-grid>
                </div>
            </div>
            <!-- 热门目的地 -->
            <div class="card hotdest-card">
                <Session-title title="热门目的地" />
                <div class="hotdest-list">
                    <van-grid :column-num="4" :gutter="8" :border="false" :clickable="false">
                        <van-grid-item v-for="(city, index) in hotCities" :key="index" @click="handleClickCity(city)">
                            <div class="hotdest-item" :class="{ active: formData.city === city }">
                                {{ city }}
                            </div>
                        </van-grid-item>
                    </van-grid>
                </div>
            </div>
        </div>


        <!-- 城市选择器弹出层 -->
        <van-popup v-model:show="showCityPicker" round position="bottom" :style="{ height: '40%' }">
            <van-picker title="请选择目的地" :columns="cityColumns" @confirm="onConfirm" @cancel="onCancel"
                @change="onChange" />
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { showFailToast } from 'vant'
// 引入类型定义
import type { CityPicker, PlanFormData } from '@/interfaces/home'
import { useRouter } from 'vue-router'
import { requireAuth } from '@/utils/requireAuth'
import { useAIStore } from '@/stores/aiStore'
const aiStore = useAIStore()

const formData = reactive<PlanFormData>({
    city: '',
    budget: undefined,
    days: undefined,
    queue_id: ""
})

//城市选择器
const showCityPicker = ref<boolean>(false)
const allCities: string[] = [...new Set([
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '天津', '郑州', '济南', '青岛',
    '大连', '沈阳', '哈尔滨', '长春', '福州', '厦门', '南昌', '合肥',
    '昆明', '贵阳', '南宁', '桂林', '海口', '三亚', '丽江', '大理',
    '西安', '兰州', '乌鲁木齐', '拉萨', '呼和浩特', '太原', '石家庄'
])]

//热门景点
const hotCities: string[] = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆']

//通过数组的map把每一项变成text/value对象放入数组
const cityColumns = allCities.map((item: string) => {
    return { text: item, value: item }
})

// 确认选择城市
const onConfirm = (result: CityPicker) => {
    formData.city = result.selectedOptions[0].value
    showCityPicker.value = false;
};

// 取消选择城市
const onCancel = () => {
    showCityPicker.value = false;
};

// 选择城市改变时触发
const onChange = (result: CityPicker) => {
    formData.city = result.selectedOptions[0].value
};

//开始规划
const router = useRouter()
const planLoading = ref<boolean>(false)
const handlePlan = () => {
    //判断有没有登陆，没有登陆的话蹦出弹窗
    if (!requireAuth()) return

    if (formData.city && !allCities.includes(formData.city)) {
        showFailToast('请选择正确的城市')
        formData.city = ''
        return
    }
    if (formData.budget && formData.budget < 100) return showFailToast('预算金额不得小于100！')
    if (formData.days && formData.days < 1) return showFailToast('旅行天数不得小于1天！')
    if (formData.days && formData.days > 7) return showFailToast('旅行天数不得大于7天！',)

    //生成队列唯一的id
    formData.queue_id = `plan_${Date.now()}`
    //判断是否方案队列已满
    if (!aiStore.addPlan(formData.queue_id)) return showFailToast('最多只能生成2个方案哦，请耐心等待~')

    //判断是否正在加载中
    if (planLoading.value) return showFailToast('请稍后再试')

    planLoading.value = true
    router.push({
        name: 'detail',
        query: {
            queueId: formData.queue_id,
            city: formData.city,
            budget: formData.budget,
            days: formData.days,
            origin: 'home'
        }
    })
}

//点击热门城市
const handleClickCity = (city: string) => {
    formData.city = city
}
</script>

<style scoped lang="scss">
.page-header {
    height: 50px;
}

.page-content {
    padding: 12px;

    .search-card {
        .search-form {
            margin-top: 14px;

            .form-item {
                background-color: #f7f8fa;
                border-radius: 8px;
                margin-bottom: 12px;
            }
        }
    }

    .fastentry-card {
        .fastentry-list {
            margin-top: 14px;
        }
    }

    .hotdest-card {
        .hotdest-list {
            .hotdest-item {
                padding: 8px 12px;
                border-radius: 16px;
                font-size: 14px;
                color: #666;
                background-color: #f7f8fa;
                transition: all 0.3s;

                &.active {
                    background-color: #007AFF;
                    color: #fff;
                }
            }
        }

    }



}
</style>