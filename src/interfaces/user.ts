//登录接口参数
export interface loginReq {
    username: string,
    password: string
}
//登录接口返回数据
export interface loginRes {
    accessToken: string,
    refreshToken: string,
    user_id: string,
    username: string,
    avatar: string,
    create_time: number
}

//获取验证码接口参数
export interface getCodeReq {
    username: string
}
//获取验证码接口返回数据
export interface getCodeRes {
    code: string
}

//注册接口参数
export interface regReq {
    username: string,
    password: string,
    confirmPassword: string,
    code: string
}
//注册接口返回数据
export interface regRes {
}

//忘记密码参数
export interface forgetReq {
    username: string,
    password: string,
    code: string
}
//忘记密码返回数据
export interface forgetRes {
}

//获取用户信息的返回数据
export interface getUserInfoRes {
    user_id: string,
    username: string,
    avatar: string,
    create_time: number,
}

//修改用户名的返回数据
export interface updateUsernameRes {
    newUsername?: string,
    suggestUsername?: string[]
}

//登录后忘记密码重置密码参数
export interface forgetResetPsdReq{
    username:string,
    newPassword:string,
    confirmPassword:string,
    resetToken:string
}
//登录后正常重置密码参数
export interface normalResetPsdReq{
    username:string,
    newPassword:string,
    confirmPassword:string,
}

