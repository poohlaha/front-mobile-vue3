/**
 * Common Store
 */
import { CONSTANT } from '@configs/index'
import { Module } from 'vuex'

export interface State {
  language: string
  skin: string
}

// 创建 Store
const Common: Module<State, any> = {
  namespaced: true,
  state: {
    language: CONSTANT.LANGUAGES[0], // 默认中文
    skin: CONSTANT.SKINS[0], // 默认orange
  },
  mutations: {},
  actions: {},
  getters: {},
}

export default Common
