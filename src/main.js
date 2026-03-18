import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import FrameInterface from './Front-End/ADMIN/FrameInterface.vue'
import CounterOrder from './Front-End/ADMIN/CounterOrder.vue'
import AdminPOS from './Front-End/ADMIN/AdminPOS.vue'
import AdminInvoice from './Front-End/ADMIN/AdminInvoice.vue'
import KhuyenMai from './Front-End/ADMIN/KhuyenMai.vue'
import Products from './Front-End/ADMIN/Products.vue'

const routes = [
    {
        path: '/',
        component: FrameInterface,
        children: [
            { path: 'DonTaiQuay', component: CounterOrder },
            { path: 'AdminPOS', component: AdminPOS },
            { path: 'AdminInvoice', component: AdminInvoice },
            { path: 'KhuyenMai', component: KhuyenMai },
            { path: 'Products', component: Products },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount('#app')