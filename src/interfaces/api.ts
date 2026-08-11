//预算明细
interface BudgetDetail {
    accommodation: number,
    food: number,
    tickets: number,
    transportation: number,
    other: number,
}
//每日行程
interface DayDetail {
    day: number,
    date: string,
    morning: {
        spot: string,
        description: string,
        duration: string,
        ticket: string,
        transportation: string,
    },
    afternoon: {
        spot: string,
        description: string,
        duration: string,
        ticket: string,
        transportation: string,
    },
    evening: {
        spot: string,
        description: string,
        duration: string,
        ticket: string,
        transportation: string,
    }
}
//返回来的方案
export interface TravelDetail {
        city?: string,
        days?: number,
        success?: boolean,
        totalBudget?: number,
        budgetBreakdown?: BudgetDetail,
        dailyItinerary?: DayDetail[],
        tips?: string[],
        warnings?: string[],
        is_collected?: boolean,
}

//普通接口响应体
export interface ApiResponse<R> {
    status: number,
    msg: string,
    success: boolean,
    data?: R,
}