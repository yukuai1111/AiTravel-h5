//对列表进行一些过滤/映射
//历史方案列表：全部要，但是显示不一样
//收藏/分享方案列表，只要成功的
import type { RawPlanItem, StandardPlanItem } from "@/interfaces/travel"
//先过滤出需要的数组
export const filterPlanList = (
    list: RawPlanItem[]
): RawPlanItem[] => {
    if (!Array.isArray(list)) return []
    //如果来源是历史，就全返回
    //不然就返回成功状态的
    return list.filter(item => {
        if ('status' in item) return true
        if ('plan_status' in item) return item.plan_status === 'success'
        return false
    })
}

//把数组里的每一个项都规范化
const normalizePlanItem = (plan: RawPlanItem): StandardPlanItem => {
    if ('status' in plan) {
        //历史列表
        return {
            itemKey: plan.plan_id,
            title: plan.title,
            planId:plan.plan_id,
            generateTime: plan.create_time,
            state: plan.status,
            failReason: plan.fail_reason,
            raw: plan,
        }
    }
    else if ('collection_id' in plan) {
        //收藏列表
        return {
            itemKey: plan.collection_id,
            title: plan.title,
            planId:plan.plan_id,
            generateTime: plan.plan_time,
            state: plan.plan_status,
            failReason: plan.plan_fail_reason,
            collectTime: plan.collect_time,
            raw: plan,
        }
    } else if('share_id' in plan){
        //分享列表
        return {
            itemKey: plan.share_id,
            title: plan.title,
            planId:plan.plan_id,
            generateTime: plan.plan_create_time,
            state: plan.plan_status,
            failReason: plan.plan_fail_reason,
            shareTime: plan.share_time,
            code: plan.code,
            isShareCancel: plan.share_is_cancel === 0, //0表示失效
            shareExpireTime: plan.share_expire_time,
            raw: plan,
        }
    }
    throw new Error('无法识别原始数据')
}

//规范化数组
export const normalizePlanList = (list: RawPlanItem[]): StandardPlanItem[] => {
    //遍历数组，把每一个子项规范化，返回数组
    return list.map(item => {
        return normalizePlanItem(item)
    })
}