export interface CityPicker{
    selectedIndex:number[],
    selectedOptions:{
        text:string,
        value:string,
    }[],
    selectedValue:string[],
    columnIndex?:number,
}
export interface PlanFormData{
    city?:string,
    budget?:number | undefined,
    days?:number | undefined,
    retry?:boolean,
    retry_id?:number
}
