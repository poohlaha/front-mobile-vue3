<template>
  <div id="app-wrapper" class="h100">
    <keep-alive v-if="keepAlive">
      <router-view class="keep-alive" :key="$route.fullPath"></router-view>
    </keep-alive>
    <router-view v-if="!keepAlive" :key="$route.fullPath"></router-view>
  </div>
</template>

<script lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
export default {
  name: 'App',
  computed: {
    route() {
      return useRoute()
    },
  },
  setup() {
    const store = useStore()
    return {
      store,
      keepAlive: false,
    }
  },
  async mounted() {
    console.log('mounted')
    const router = useRouter()
    const route = useRoute()

    await router.isReady() // 等待路由准备就绪
    this.keepAlive = route.meta?.keepAlive || false
    console.log('keepAlive:', this.keepAlive)
    document.body.classList.add(this.store.state.commonStore.skin)
  },
}
</script>
