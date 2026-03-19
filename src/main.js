import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import FrameInterface from './Front-End/ADMIN/FrameInterface.vue'
import CounterOrder from './Front-End/ADMIN/CounterOrder.vue'
import AdminPOS from './Front-End/ADMIN/AdminPOS.vue'
import AdminInvoice from './Front-End/ADMIN/AdminInvoice.vue'
import KhuyenMai from './Front-End/ADMIN/KhuyenMai.vue'
import OrderList from './Front-End/ADMIN/OrderList.vue'
import Products from './Front-End/ADMIN/Products.vue'
import AdminEmployee from './Front-End/ADMIN/AdminEmployee.vue'

const routes = [
    {
        path: '/',
        component: FrameInterface,
        children: [
            { path: 'QuanLyDonTaiQuay', component: CounterOrder },
            { path: 'AdminPOS', component: AdminPOS },
            { path: 'QuanLyHoaDon', component: AdminInvoice },
            { path: 'QuanLyKhuyenMai', component: KhuyenMai },
            { path: 'QuanLyDonHang', component: OrderList },
            { path: 'QuanLySanPham', component: Products },
            { path: 'QuanLyNhanVien', component: AdminEmployee },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount('#app')