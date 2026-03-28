import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './main.css'

<<<<<<< HEAD
import InterfaceHomePage from '@/Front-End/USER/InterfaceHomePage.vue'
import UserStores from '../Front-End/USER/UserStores.vue'

=======
import InterfaceHomePage from '../Front-End/USER/InterfaceHomePage.vue'
import UserAccount from '../Front-End/USER/UserAccount.vue'
import UserChangePassword from '../Front-End/USER/UserChangePassword.vue'
import UserAddress from '../Front-End/USER/UserAddress.vue'
import UserOrders from '../Front-End/USER/UserOrders.vue'
>>>>>>> 64a311af66fc0bed59082fdb5a2b09b49a555175

const routes = [
    {
        path: '/',
        component: InterfaceHomePage,
        children: [
            {
<<<<<<< HEAD
                path: '',
                redirect: '/homepage'
            },
            {
                path: 'homepage',
                component: InterfaceHomePage
            },
            {
                path: 'stores',
                component: UserStores
=======
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
>>>>>>> 64a311af66fc0bed59082fdb5a2b09b49a555175
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App).use(router).mount('#app')