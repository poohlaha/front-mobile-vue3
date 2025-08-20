<template>
  <div id="app-wrapper" class="h100">
    <keep-alive v-if="keepAlive">
      <router-view class="keep-alive" :key="$route.fullPath"></router-view>
    </keep-alive>
    <router-view v-if="!keepAlive" :key="$route.fullPath"></router-view>
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@stores/index'

export default {
  name: 'App',
  computed: {},
  setup() {
    return {
      keepAlive: false
    }
  },
  async mounted() {
    const router = window.VueRouter.useRouter()
    const route = window.VueRouter.useRoute()

    await router.isReady() // 等待路由准备就绪
    this.keepAlive = route.meta?.keepAlive || false
    console.log('keepAlive:', this.keepAlive)

    const commonStore = useCommonStore()
    const { skin } = storeToRefs(commonStore)
    document.body.classList.add(skin.value || '')
    document.body.classList.add('color')
    document.body.classList.add('font-sm')
  }
}
</script>
