import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import './main.css'
import { useAuthStore } from '../Front-End/Authorization/Auth'

//gate boiz
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired lmao
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)


//Holy maccaroni that sa lot ta spaghet

import InterfaceHomePage from '../Front-End/USER/InterfaceHomePage.vue'
import Homepage from '../Front-End/USER/Homepage.vue'
import UserAccount from '../Front-End/USER/UserAccount.vue'
import UserChangePassword from '../Front-End/USER/UserChangePassword.vue'
import UserAddress from '../Front-End/USER/UserAddress.vue'
import UserOrders from '../Front-End/USER/UserOrders.vue'
import UserStores from '../Front-End/USER/UserStores.vue'
import MenuView from '../Front-End/USER/MenuView.vue'
import ProductDetailView from '../Front-End/USER/ProductDetailView.vue'
import AboutUS from '../Front-End/USER/AboutUS.vue'
import CartView from '../Front-End/USER/Cart.vue'

//Uy quyen login
import LoginAcc from '../Front-End/Authorization/Login.vue'
import RegisterAcc from '../Front-End/Authorization/Register.vue'



const routes = [
    {
        path: '/',
        component: InterfaceHomePage,
        redirect: '/homepage',
        children: [
            {
                path: '/account',
                component: UserAccount,
                meta: {requireAuth: true}
            },
            {
                path: '/account/password',
                component: UserChangePassword,
                meta: {requireAuth: true}
            },
            {
                path: '/account/address',
                component: UserAddress,
                meta: {requireAuth: true}
            },
            {
                path: '/account/orders',
                component: UserOrders,
                meta: {requireAuth: true}
            },
            {
                path: '/menu',
                component: MenuView
            },
            {
                path: 'product/:id', name: 'user-product', component: ProductDetailView
            },
            {
                path: '/stores',
                component: UserStores
            },
            {
                path: '/homepage',
                component: Homepage
            },
            {
                path: '/AboutUS',
                component: AboutUS
            },
            {
                path: '/cart',
                component: CartView,
                meta: {requireAuth: true}
            },
        ]
    },
    {
        path: '/login',
        component: LoginAcc
    },
    {
        path: '/register',
        component: RegisterAcc
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  // Check if a user exists in this localhost's storage
  const isAuthenticated = !!localStorage.getItem('user')

  if (to.meta.requireAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/homepage')
  } else {
    next()
  }
})


const app = createApp(App)
const pinia = createPinia()


const authStore = useAuthStore(pinia)

//check user status before startup
const savedUser = localStorage.getItem('user')
const savedToken = localStorage.getItem('token')

if (savedUser && savedToken) {
  authStore.setUser(JSON.parse(savedUser), savedToken)
}


app.use(pinia)
app.use(router)
app.mount('#app')