/**
 * Common Store
 */
import { CONSTANT } from '@configs/index'
import { defineStore } from 'pinia'

const useCommonStore = defineStore('commonStore', {
  state: () => ({
    language: CONSTANT.LANGUAGES[0], // 默认中文
    skin: CONSTANT.SKINS[0], // 默认orange
  }),
  getters: {},
  actions: {},
})

export default useCommonStore
