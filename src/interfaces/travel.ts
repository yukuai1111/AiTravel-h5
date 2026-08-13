import type { TravelDetail } from '@/interfaces/api'
//获取历史方案列表响应体
export interface getHistoryPlanRes {
    size: number,
    nextCursor: number | null,
    hasMore: boolean,
    planResult: {
        plan_id: number,
        title: string,
        create_time: number,
        status: string,
        fail_reason: string | null,
    }[]
}

//获取分享方案详情的响应
export interface getShareDetailRes {
    avatar: string,
    plan_id: number,
    title: string,
    plan_create_time: number,
    username: string,
    content: TravelDetail,
}

//获取分享方案详情的响应
export interface getDetailRes {
    plan_id: number,
    title: string,
    create_time: number,
    content: TravelDetail,
    is_collected: boolean,
}

//获取收藏方案列表响应体
export interface getCollectPlanRes {
    size: number,
    nextCursor: number | null,
    hasMore: boolean,
    collectPlan: {
        collection_id: number,
        plan_id: number,
        title: string,
        plan_time: number,
        collect_time: number,
        plan_status: string,
        plan_fail_reason: string | null,
    }[]
}

//获取已分享的方案列表响应体
export interface getSharedPlanRes {
    size: number,
    nextCursor: number | null,
    hasMore: boolean,
    sharedPlanList: {
        share_id: number,
        share_expire_time: number,
        plan_id: number,
        code: string,
        share_is_cancel: number,
        title: string,
        plan_create_time: number,
        share_time: number,
        plan_status: string,
        plan_fail_reason: string | null,
    }[]
}


//各自数组的子项
export type RawPlanItem = getHistoryPlanRes['planResult'][number]
    | getCollectPlanRes['collectPlan'][number]
    | getSharedPlanRes['sharedPlanList'][number]
//把三种数组的子项结合一下，抽出意义相同但是字段不同的
export type StandardPlanItem = {
    itemKey: number,
    title: string,
    planId:number,
    generateTime: number,
    state: string,
    failReason: string | null,
    collectTime?: number,
    shareTime?: number,
    code?:string,
    isShareCancel?:boolean,
    timeText?:string,
    shareExpireTime?:number,
    raw: RawPlanItem,
}