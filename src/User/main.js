import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './main.css'

import InterfaceHomePage from '../Front-End/USER/InterfaceHomePage.vue'
import UserAccount from '../Front-End/USER/UserAccount.vue'
import UserChangePassword from '../Front-End/USER/UserChangePassword.vue'
import UserAddress from '../Front-End/USER/UserAddress.vue'
import UserOrders from '../Front-End/USER/UserOrders.vue'
import UserStores from '../Front-End/USER/UserStores.vue'

const routes = [
    {
        path: '/',
        component: InterfaceHomePage,
        children: [
            {
                path: '/account',
                component: UserAccount
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
                path: '/homepage',
                component: InterfaceHomePage
            },

        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App).use(router).mount('#app')