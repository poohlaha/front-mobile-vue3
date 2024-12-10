import { RouterUrls } from './urls'

const routes = [
  {
    path: '/',
    name: RouterUrls.HOME.HOME_URL,
    component: () => import(/* webpackChunkName: "home" */ '../views/pages/home/index.vue'),
    meta: {
      title: RouterUrls.HOME.HOME_TITLE,
      keepAlive: true,
    },
  },
]

export default routes
