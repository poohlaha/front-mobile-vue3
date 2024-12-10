/**
 * Home Store
 */
import { Module } from 'vuex'

// 定义 State 接口
export interface State {}

// 创建 Store
const Home: Module<State, any> = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {},
  getters: {},
}

export default Home
