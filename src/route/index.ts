import routes from './router'

const router = window.VueRouter.createRouter({
  history: window.VueRouter.createWebHistory(process.env.VUE_APP_PUBLIC_URL),
  routes
})

// 解决app路由模块无法加载的问题
router.onError(error => {
  console.log('error', error)
  const pattern = /^(Loading chunk )[a-zA-Z]+( failed)/g
  const isChunkLoadFailed = error.message.match(pattern)
  if (isChunkLoadFailed) {
    location.reload()
  }
})

// 添加标题
router.beforeEach((to, from, next) => {
  const title = to.meta?.title
  if (title) {
    // @ts-ignore
    document.title = title
  }
  next()
})

// 解决添加重复路由的问题
const routerPush = router.push
router.push = function (location) {
  return routerPush.call(this, location).catch(error => error)
}

// 重写路由 push, 用于同一路由不同参数跳转
const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
