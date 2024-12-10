import { createApp } from 'vue'

import App from './index.vue'
import router from '../../route'

import 'lib-flexible'
import '@assets/styles/skin/index.less'
import store from '@stores/index'

const app = createApp(App)
app.use(store)

// 注册 router
app.use(router)

app.mount('#app')
