/**
 * Home Store
 */
import { createStore } from 'vuex'
// 定义 State 接口
export interface State {}

// 创建 Store
const Home = createStore<State>({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
})

export default Home
