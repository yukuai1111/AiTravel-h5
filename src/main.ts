import { createApp } from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import 'vant/lib/index.css'
import 'vant/es/toast/style'
import './assets/styles/common.scss'

//引入路由对象
import router from './router/index.ts'

createApp(App).use(router).use(createPinia()).mount('#app')
