import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { createPinia } from 'pinia'
import './main.css'

import InterfaceHomePage from '../Front-End/USER/InterfaceHomePage.vue'
import Homepage from '../Front-End/USER/Homepage.vue'
import UserAccount from '../Front-End/USER/UserAccount.vue'
import UserChangePassword from '../Front-End/USER/UserChangePassword.vue'
import UserAddress from '../Front-End/USER/UserAddress.vue'
import UserOrders from '../Front-End/USER/UserOrders.vue'
import UserStores from '../Front-End/USER/UserStores.vue'
import MenuView from '../Front-End/USER/MenuView.vue'
import ProductDetailView from '../Front-End/USER/ProductDetailView.vue'
import UserReceipts from '../Front-End/USER/UserReceipts.vue'
import AboutUS from '../Front-End/USER/AboutUS.vue'

//Uy quyen
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
                component: UserAccount
            },
            {
                path: '',
                redirect: '/menu'
            },
            {
                path: 'menu',
                component: MenuView
            },
            {
                path: 'product/:id', name: 'user-product', component: ProductDetailView
            },
            {
                path: '/account/password',
                component: UserChangePassword
            },
            {
                path: '/account/address',
                component: UserAddress
            },
            {
                path: '/account/orders',
                component: UserOrders
            },
            {
                path: '/stores',
                component: UserStores
            },
            {
                path: '/account/receipts',
                component: UserReceipts
            },
            {
                path: '/homepage',
                component: Homepage
            },
            {
                path: '/AboutUS',
                component: AboutUS
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

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)      // ✅ quan trọng
app.use(router)
app.mount('#app')