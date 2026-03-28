import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './main.css'

import InterfaceHomePage from '@/Front-End/USER/InterfaceHomePage.vue'
import UserStores from '../Front-End/USER/UserStores.vue'


const routes = [
    {
        path: '/',
        component: InterfaceHomePage,
        children: [
            {
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
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App).use(router).mount('#app')