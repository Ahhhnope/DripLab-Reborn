import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './main.css'

import InterfaceHomePage from '@/Front-End/USER/InterfaceHomePage.vue'

const routes = [
    {
        path: '/',
        redirect: '/homepage'
    },
    {
        path: '/homepage',
        component: InterfaceHomePage,
        children: []
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App).use(router).mount('#app')