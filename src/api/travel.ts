import { post, get, remove,put } from '@/utils/request'
import type { PlanFormData } from '@/interfaces/home'
import type { TravelDetail } from '@/interfaces/api'
import type { getHistoryPlanRes, getShareDetailRes, getDetailRes,getCollectPlanRes,getSharedPlanRes } from '@/interfaces/travel'

//获取旅游规划
export const getPlan = async (data: PlanFormData, signal?: AbortSignal) => {
    return post<PlanFormData, { plan_id: number, planData: TravelDetail }>('/travel/recommend', data, signal)
}

//获取历史方案列表
export const getHistoryPlan = async (pageSize?:number,cursor?:number|null) => {
    return get<{pageSize?:number,cursor?:number|null}, getHistoryPlanRes>('/travel/history',{pageSize,cursor})
}
//删除方案
export const deletePlan = async (plan_id: number) => {
    return remove<{ plan_id: number }, unknown>('/travel/remove', { plan_id })
}
//分享方案
export const sharePlan = async (plan_id: number) => {
    return post<unknown, { shareCode: string,share_time:number }>(`/travel/share/${plan_id}`)
}
//分享方案的详情
export const sharePlanDetail = async (code: string) => {
    return get<{ code: string }, getShareDetailRes>(`/share/sharePage?code=${code}`)
}

//获取方案详情
export const planDetail = async (plan_id: number) => {
    return get<{ plan_id: number }, getDetailRes>(`/travel/detail?plan_id=${plan_id}`)
}

//修改方案标题
export const changePlanTitle=async (data:{plan_id:number,title:string})=>{
    return put<{plan_id:number,title:string},{newTitle:string}>(`/travel/title`,data)
}

//收藏方案
export const collectPlan=async (plan_id:number)=>{
    return post<{plan_id:number},unknown>(`/travel/collect`,{plan_id})
}

//取消收藏方案
export const cancelCollectPlan=async (plan_id:number)=>{
    return remove<{plan_id:number},unknown>(`/travel/cancelCollect`,{plan_id})
}

//获取收藏方案列表
export const getCollectPlan=async ()=>{
    return get<unknown,getCollectPlanRes>('/travel/collectionList')
}

//获取已分享的方案列表
export const sharedPlan=async ()=>{
    return get<unknown,getSharedPlanRes>('/travel/sharedList')
}

//取消分享方案
export const cancelSharePlan=async (code:string)=>{
    return put<{code:string},unknown>(`/travel/cancelShare/${code}`)
}

//删除分享方案
export const deleteSharedPlan=async (code:string)=>{
    return remove<{code:string},unknown>(`/travel/deleteShared/${code}`)
}
