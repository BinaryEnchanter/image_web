import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Wallpapers from '../pages/Wallpapers.vue'
import Login from '../pages/Login.vue'
import UserProfile from '../pages/UserProfile.vue'
import ImageDetail from '../pages/ImageDetail.vue'
import Upload from '../pages/Upload.vue'
import Recharge from '../pages/Recharge.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/wallpapers', component: Wallpapers },
  { path: '/login', component: Login },
  { path: '/me', component: UserProfile },
  { path: '/image/:id', component: ImageDetail, props: true },
  { path: '/upload', component: Upload },
  { path:'/recharge',component:Recharge}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
