import App from './index.vue'
import router from '../../route'
import { createPinia } from 'pinia'

import '@assets/styles/skin/index.less'
import '@assets/styles/common/tailwind.css'

const app = window.Vue.createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(window.vant)
app.use(window.vant.Lazyload)

// 注册 router
app.use(router)

app.mount('#app')
