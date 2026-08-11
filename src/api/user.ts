import { post, get ,remove,put,server} from '@/utils/request'
import type { loginReq, loginRes,getCodeReq,getCodeRes,regReq,regRes,forgetReq,forgetRes,getUserInfoRes
   ,updateUsernameRes,forgetResetPsdReq,normalResetPsdReq} from '@/interfaces/user'
   //登录接口
export const login = async (data: loginReq) => {
    return await post<loginReq, loginRes>('/user/login', data)
}

//获取注册验证码接口
export const getRegCode=async (data:getCodeReq)=>{
    return await post<getCodeReq,getCodeRes>('/user/registerCode',data)
}

//注册接口
export const register=async (data:regReq)=>{
    return await post<regReq,regRes>('/user/register',data)
}

//获取忘记密码验证码接口
export const getForgetCode=async (data:getCodeReq)=>{
    return await post<getCodeReq,getCodeRes>('/user/forgetCode',data)
}

//忘记密码接口
export const forgetPassword=async (data:forgetReq)=>{
    return await post<forgetReq,forgetRes>('/user/forgetPsd',data)
}

//获取用户信息接口
export const getUserInfo=async ()=>{
    return await get<unknown,getUserInfoRes>('/account/userinfo?timestamp='+Date.now())
}

//退出登录接口
export const logout=async (refreshToken:string)=>{
    return await remove<unknown,string>('/account/logout',{refreshToken})
}

//注销账号接口
export const removeAccount=async ()=>{
    return await remove<unknown,unknown>('/account/remove')
}

//修改用户名接口
export const updateUsername=async (data:{username:string})=>{
    return await put<{username:string},updateUsernameRes>('/account/changeUsername',data)
}

//修改头像接口
export const updateAvatar=async ({avatar}:{avatar:File})=>{
    const formData=new FormData()
    formData.append('avatar',avatar)
    return await server.put('/account/changeAvatar',formData,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    })
}

//登录后忘记密码获取验证码
export const getLoginForgetCode=async (data:getCodeReq)=>{
return await post<getCodeReq,getCodeRes>('/account/resetCode',data)
}

//登录后忘记密码验证验证码
export const verifyLoginForgetCode=async (data:{username:string,code:string})=>{
return await post<{username:string,code:string},{resetToken:string}>('/account/verifyResetCode',data)
}

//登录后忘记密码的重置密码
export const resetPsdByCode=async (data:forgetResetPsdReq)=>{
return await put<forgetResetPsdReq,unknown>('/account/resetPsdByCode',data)
}

//登录后正常重置密码
export const resetPsd=async (data:normalResetPsdReq)=>{
return await put<normalResetPsdReq,unknown>('/account/resetPsd',data)
}
