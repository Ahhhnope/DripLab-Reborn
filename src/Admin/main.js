import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Import CSS (Rất quan trọng để Tailwind hoạt động)
import './main.css'

// Import các Component chính
import FrameInterface from '@/Front-End/ADMIN/FrameInterface.vue'
import CounterOrder from '@/Front-End/ADMIN/CounterOrder.vue'
import AdminPOScustom from '@/Front-End/ADMIN/AdminPOScustom.vue'
import AdminInvoice from '@/Front-End/ADMIN/AdminInvoice.vue'
import KhuyenMai from '@/Front-End/ADMIN/KhuyenMai.vue'
import OrderList from '@/Front-End/ADMIN/OrderList.vue'
import Products from '@/Front-End/ADMIN/Products.vue'
import AdminEmployee from '@/Front-End/ADMIN/AdminEmployee.vue'
import AdminQLKH from '@/Front-End/ADMIN/AdminQLKH.vue'

// Import các Component thành phần sản phẩm
import QuanLySPCachThuc from '@/Front-End/ADMIN/QuanLySPCachThuc.vue'
import QuanLySPSua from '@/Front-End/ADMIN/QuanLySPSua.vue'
import QuanLySPHatCaPhe from '@/Front-End/ADMIN/QuanLySPHatCaPhe.vue'
import QuanLySPkem from '@/Front-End/ADMIN/QuanLySPkem.vue'
import QuanLySPKemBeo from '@/Front-End/ADMIN/QuanLySPKemBeo.vue'
import Toppings from '../Front-End/ADMIN/Toppings.vue'
import AdminDashboard from '../Front-End/ADMIN/AdminDashboard.vue'
import Login from '../Front-End/Authorization/Login.vue'

const pinia = createPinia();
const routes = [
    {
        path: '/',
        component: FrameInterface,
        children: [
            { path: 'QuanLyDonTaiQuay', component: CounterOrder },
            { path: 'AdminPOS', component: AdminPOScustom },
            { path: 'QuanLyHoaDon', component: AdminInvoice },
            { path: 'QuanLyKhuyenMai', component: KhuyenMai },
            { path: 'QuanLyDonHang', component: OrderList },
            { path: 'QuanLySanPham', component: Products },
            { path: 'QuanLyNhanVien', component: AdminEmployee },
            { path: 'QuanLyKhachHang', component: AdminQLKH },
            { path: 'SanPhamKem', component: QuanLySPkem },
            { path: 'SanPhamkemBeo', component: QuanLySPKemBeo },
            { path: 'SanPhamSua', component: QuanLySPSua },
            { path: 'SanPhamHatCaPhe', component: QuanLySPHatCaPhe },
            { path: 'QuanLyCachThuc', component: QuanLySPCachThuc },
            { path: 'QuanLyTopping', component: Toppings },
            { path: 'Dashboard', component: AdminDashboard },
        ]
    },
    { path: '/login', component: Login },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});




createApp(App).use(pinia).use(router).mount('#app')