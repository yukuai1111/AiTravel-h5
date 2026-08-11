//校验用户名
export const validateUsername = (username: string) => {
    if (!username.trim()) return '请输入用户名'
    if (username.trim().length < 3 || username.trim().length > 20) return '用户名长度必须在3-20位之间'
    return true
}
//校验密码
export const validatePassword = (password: string) => {
    if (!password.trim()) return '请输入密码'
    if (password.trim().length < 6 || password.trim().length > 12) return '密码长度必须在6-12位之间'
    if (!/^[a-zA-Z0-9_]+$/.test(password.trim())) return '密码只能有数字，字母和下划线'
    return true
}
//校验密码是否一致
export const validatePasswordSame = (password: string, confirmPassword: string) => {
    if (password.trim() !== confirmPassword.trim()) return '两次密码不一致'
    return true
}
//校验验证码
export const validateCode = (code: string) => {
    if (!code.trim()) return '请输入验证码'
    if (!/^(?=(?:.*[a-zA-Z]){4})(?=(?:.*\d){1})[a-zA-Z0-9]{5}$/
        .test(code.trim())) return '请输入正确的验证码'
    return true
}

//检验旅游方案标题
export const validateTitle = (title: string) => {
    if (!title.trim()) return '请输入标题'
    if (title.trim().length < 1 || title.trim().length > 25) return '标题长度必须在1-25位之间'
    return true
}
