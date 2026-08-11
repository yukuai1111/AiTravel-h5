//计算还剩下多久时间过期（倒计时）
export const countDown=(now:number,expire:number)=>{
    const diff=expire-now
    if(diff<=0){
        return '已失效'
    }
    const day=Math.floor(diff/1000/60/60/24)
    const hour=Math.floor(diff/1000/60/60%24)
    const minute=Math.floor(diff/1000/60%60)
    const second=Math.floor(diff/1000%60)
    return `${day}天${hour}时${minute}分${second}秒`
}