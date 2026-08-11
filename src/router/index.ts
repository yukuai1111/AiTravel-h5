//引入创建路由以及工作模式
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
//定义路由规则
const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
        component: () => import('@/views/Home.vue')
    },
    {
        path: '/chat',
        name: 'chat',
        component: () => import('@/views/Chat.vue')
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue')
    },
    {
        path: '/my/detail',
        name: 'detail',
        component: () => import('@/views/Detail.vue')
    },
    {
        path: '/my/options',
        name: 'options',
        component: () => import('@/views/Options.vue'),
    },
    {
        path: '/my/history',
        name: 'history',
        component: () => import('@/views/History.vue')
    },
    {
        path: '/my/collect',
        name: 'collect',
        component: () => import('@/views/Collect.vue')
    },
    {
        path: '/my/personal',
        name: 'personal',
        component: () => import('@/views/Personal.vue')
    },
    {
        path: '/my/preview',
        name: 'preview',
        component: () => import('@/views/Preview.vue')
    },
    {
        path: '/my/safe',
        name: 'safe',
        component: () => import('@/views/Safe.vue')
    },
    {
        path: '/my/resetPsd',
        name: 'resetPsd',
        component: () => import('@/views/ResetPsd.vue')
    }, {
        path: "/my/share",
        name: "share",
        component: () => import('@/views/Share.vue')
    },
    {
        path: '/sharePage',
        name: 'sharePage',
        component: () => import('@/views/SharePage.vue')
    },{
        path: '/noFound',
        name: 'noFound',
        component: () => import('@/views/NoFound.vue')
    },
    {
        path: '/my/about',
        name: 'about',
        component: () => import('@/views/About.vue')
    }
]

//创建路由对象
const router = createRouter({
    history: createWebHistory(),
    routes
})

//路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    //如果走到不存在页面
    if(to.matched.length === 0){
        next('/noFound')
        return
    }
    // /my 开头的页面需要登录
    if (to.path.startsWith('/my') && !userStore.isLogin) {
        next('/profile')
        return
    }
    next()
})
//导出路由对象
export default router