import { createApp } from 'vue'

import App from './index.vue'
import router from '../../route'

import '../../assets/styles/skin/index.less'
import store from '@stores/index'

// UI 组件
import 'vant/lib/index.css'

import { Button, Toast, Field, CellGroup, Swipe, SwipeItem, Tabbar, TabbarItem } from 'vant'

const app = createApp(App)
app.use(store)

// 注册 router
app.use(router)

// 注册UI组件
app.use(Button).use(Toast).use(Field).use(CellGroup)
app.use(Swipe)
app.use(SwipeItem)
app.use(Tabbar)
app.use(TabbarItem)

app.mount('#app')
