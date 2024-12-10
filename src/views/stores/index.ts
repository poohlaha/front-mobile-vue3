/**
 * 导出所有Store
 */
import homeStore from './home'
import commonStore from './common'
import { createStore } from 'vuex'

export default createStore({
  modules: {
    homeStore,
    commonStore,
  },
})
