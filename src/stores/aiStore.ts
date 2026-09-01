import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAIStore = defineStore('ai', () => {
    // 当前 AI 任务的控制器池
    const controllers = ref(new Map())
    //当前方案正在生产的队列
    const plans = ref<string[]>([])

    //创建新的取消控制器（开始某个ai -> 开始聊天/方案生成）
    const createController = (id: string) => {
        //创建新的控制器
        const newController = new AbortController()
        //添加到控制器池
        controllers.value.set(id, newController)  //之后根据id获取控制器
        //返回新的控制器
        return newController
    }

    //清除单个取消控制器（停止某个ai -> 切换聊天页/方案生成成功或失败）
    const removeController = (id: string) => {
        const controller = controllers.value.get(id)  //找到控制器
        if (controller) {
            //1.取消请求
            controller.abort()
            //2.从控制池删除控制器
            controllers.value.delete(id)
        }
    }

    //清除所有的控制器（停止所有ai -> 退出登录/注销账号）
    const removeControllerAll = () => {
        //遍历控制器池，清除每一个请求
        for (const [id, controller] of controllers.value) {
            controller.abort()
        }
        //清除控制器池
        controllers.value.clear()
    }

    //判断方案是否大于2
    const isMatchMax = computed(() => {
        return plans.value.length >= 2
    })

    //增添方案队列(开始生成方案)
    const addPlan = (id: string) => {
        //判断队列是否已满
        if (isMatchMax.value) {
            return false
        }
        //判断id是否已存在队列
        if (plans.value.includes(id)) {
            return false
        }
        plans.value.push(id)
        return true
    }

    //移除方案队列(方案生成成功或失败)
    const removePlan = (id: string) => {
        plans.value = plans.value.filter((item) => item !== id)
    }

    //清除所有方案队列（退出登录/注销账号）
    const clearPlans = () => {
        plans.value = []
    }
    return {
        controllers,
        plans,
        createController,
        removeController,
        removeControllerAll,
        addPlan,
        removePlan,
        clearPlans,
    }
}) 
