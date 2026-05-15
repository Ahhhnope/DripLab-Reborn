import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { createPinia } from 'pinia'
import './main.css'
import { useAuthStore } from '../Front-End/Authorization/Auth'

// Components
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
import Voucher from '../Front-End/USER/Voucher.vue'
import Brewing from '../Front-End/USER/Brewing.vue'
import LoginAcc from '../Front-End/Authorization/Login.vue'
import RegisterAcc from '../Front-End/Authorization/Register.vue'
import UserPoints from '../Front-End/USER/UserPoints.vue'
import ChooseStores from '../Front-End/USER/ChooseStores.vue'
import ForgotPassword from '@/Front-End/Authorization/Forgotpassword.vue'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const routes = [
    {
        path: '/',
        component: InterfaceHomePage,
        redirect: '/homepage',
        children: [
            { path: '/account', component: UserAccount, meta: {requiresAuth: true} },
            { path: '/account/password', component: UserChangePassword, meta: {requiresAuth: true} },
            { path: '/account/address', component: UserAddress, meta: {requiresAuth: true} },
            { path: '/account/orders', component: UserOrders, meta: {requiresAuth: true} },
            { path: '/account/points', component: UserPoints, meta: {requiresAuth: true} },
            { path: '/brewing', component: Brewing },
            { path: '/choosestores', component: ChooseStores },
            { path: '/menu', component: MenuView },
            { path: 'product/:id', name: 'user-product', component: ProductDetailView },
            { path: '/stores', component: UserStores },
            { path: '/homepage', component: Homepage },
            { path: '/AboutUS', component: AboutUS },
            { path: '/cart', component: CartView, meta: {requiresAuth: true} },
            { path: '/voucher', component: Voucher },
        ]
    },
    { path: '/login', component: LoginAcc },
    { path: '/register', component: RegisterAcc },
    { path: '/forgot-password', component: ForgotPassword },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

const auth = useAuthStore()
auth.init() // Start in background

app.use(router)
app.mount('#app')

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    if (!auth.isInitialized) {
        await auth.init()
    }

    // ADMIN on user site → redirect to admin
    // if (auth.user && auth.user.role === 'ADMIN' && to.meta.requiresAuth) {
    //     window.location.replace('http://localhost:5005/')
    //     return next(false)
    // }

    // Requires auth but not logged in
    if (to.meta.requiresAuth && !auth.user) {
        return next('/login')
    }

    // After logging in - redirect to /choosestores (in Login.js)

    next()
})
