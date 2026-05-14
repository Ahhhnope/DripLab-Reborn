import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import './main.css'

import FrameInterface from '@/Front-End/ADMIN/FrameInterface.vue'
import CounterOrder from '@/Front-End/ADMIN/CounterOrder.vue'
import AdminPOScustom from '@/Front-End/ADMIN/AdminPOScustom.vue'
import AdminInvoice from '@/Front-End/ADMIN/AdminInvoice.vue'
import KhuyenMai from '@/Front-End/ADMIN/KhuyenMai.vue'
import OrderList from '@/Front-End/ADMIN/OrderList.vue'
import Products from '@/Front-End/ADMIN/Products.vue'
import AdminEmployee from '@/Front-End/ADMIN/AdminEmployee.vue'
import AdminQLKH from '@/Front-End/ADMIN/AdminQLKH.vue'
import QuanLySPCachThuc from '@/Front-End/ADMIN/QuanLySPCachThuc.vue'
import QuanLySPSua from '@/Front-End/ADMIN/QuanLySPSua.vue'
import QuanLySPHatCaPhe from '@/Front-End/ADMIN/QuanLySPHatCaPhe.vue'
import QuanLySPkem from '@/Front-End/ADMIN/QuanLySPkem.vue'
import QuanLySPKemBeo from '@/Front-End/ADMIN/QuanLySPKemBeo.vue'
import Toppings from '../Front-End/ADMIN/Toppings.vue'
import AdminDashboard from '../Front-End/ADMIN/AdminDashboard.vue'
import Login from '../Front-End/Authorization/Login.vue'
import QuanLyDatBan from '@/Front-End/ADMIN/AdminDatBan.vue'
import { useAuthStore } from '../Front-End/Authorization/Auth'
import AdminDatBan from '@/Front-End/ADMIN/AdminDatBan.vue'

const pinia = createPinia()
const routes = [
    {
        path: '/',
        component: FrameInterface,
        meta: { requiresAuth: true },
        children: [
            { path: 'QuanLyDonTaiQuay', component: CounterOrder, meta: { keepAlive: true, roles: ['ADMIN', 'EMPLOYEE'] } },
            { path: 'AdminPOS', component: AdminPOScustom, meta: { roles: ['ADMIN', 'EMPLOYEE'] } },
            { path: 'QuanLyHoaDon', component: AdminInvoice, meta: { roles: ['ADMIN', 'EMPLOYEE'] } },
            { path: 'QuanLyDonHang', component: OrderList, meta: { roles: ['ADMIN', 'EMPLOYEE'] } },
            { path: 'QuanLyDatBan', component: AdminDatBan, meta: { roles: ['ADMIN', 'EMPLOYEE'] } },

            { path: 'QuanLyKhuyenMai', component: KhuyenMai, meta: { roles: ['ADMIN'] } },
            { path: 'QuanLySanPham', component: Products, meta: { roles: ['ADMIN'] } },
            { path: 'QuanLyNhanVien', component: AdminEmployee, meta: { roles: ['ADMIN'] } },
            { path: 'QuanLyKhachHang', component: AdminQLKH, meta: { roles: ['ADMIN'] } },
            { path: 'SanPhamKem', component: QuanLySPkem, meta: { roles: ['ADMIN'] } },
            { path: 'SanPhamkemBeo', component: QuanLySPKemBeo, meta: { roles: ['ADMIN'] } },
            { path: 'SanPhamSua', component: QuanLySPSua, meta: { roles: ['ADMIN'] } },
            { path: 'SanPhamHatCaPhe', component: QuanLySPHatCaPhe, meta: { roles: ['ADMIN'] } },
            { path: 'QuanLyCachThuc', component: QuanLySPCachThuc, meta: { roles: ['ADMIN'] } },
            { path: 'QuanLyTopping', component: Toppings, meta: { roles: ['ADMIN'] } },
            { path: 'Dashboard', component: AdminDashboard, meta: { roles: ['ADMIN'] } },
        ]
    },
    { path: '/login', component: Login },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)
app.use(pinia)

const auth = useAuthStore()
auth.init() // Start in background

app.use(router)
app.mount('#app')

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()
    if (!auth.isInitialized) {
        await auth.init()
    }
    console.log('Admin guard - user:', auth.user, 'role:', auth.user?.role);

    // need login
    if (!auth.user && to.meta.requiresAuth) {
        return next('/login')
    }

    // not admin / employee role -> redirect to user site
    if (auth.user && auth.user.role !== 'ADMIN' && auth.user.role !== 'EMPLOYEE' && to.meta.requiresAuth) {
        alert("lmao u aint admin / employee")
        window.location.replace('http://localhost:5173/homepage')
        return next(false)
    }

    // already logged in - redirect away from login
    if (auth.user && (to.path === '/login' || to.path === '/')) {
        if (auth.user.role === 'ADMIN') return next('/Dashboard')
        if (auth.user.role === 'EMPLOYEE') return next('/QuanLyDonTaiQuay')
    }

    if (auth.user?.role === 'EMPLOYEE') {
        const allowedRoles = to.meta.roles || []

        if (!allowedRoles.includes(auth.user.role)) {
            alert('Bạn không có quyền dùng chức năng này')
            return next('/QuanLyDonTaiQuay')
        }
    }

    next()
})
