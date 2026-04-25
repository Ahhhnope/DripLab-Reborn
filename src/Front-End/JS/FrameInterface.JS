import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../Authorization/Auth'

import {
    HomeIcon, ShoppingCartIcon, CubeIcon, UsersIcon,
    DocumentTextIcon, TicketIcon, NewspaperIcon,
    UserCircleIcon, AdjustmentsHorizontalIcon,
    ChartBarIcon, UserGroupIcon
} from '@heroicons/vue/24/outline'

export function useAdminMenu() {
    const route = useRoute()
    const router = useRouter()

    const activeIndex = ref(1)
    const openMenu = ref(null)
    const openSub = ref(null)

    const auth = useAuthStore()

    // === DANH SÁCH MENU (giữ nguyên) ===
    const menuGroups = [
        {
            title: 'Báo cáo & Phân tích',
            items: [
                { id: 1, label: 'Thống kê', icon: ChartBarIcon, path: '/Dashboard' },
            ]
        },
        {
            title: 'Quản lý bán hàng',
            items: [
                {
                    id: 2,
                    label: 'Đơn tại quầy',
                    icon: ShoppingCartIcon,
                    path: '/QuanLyDonTaiQuay', // vẫn có link
                    children: [
                        { id: 21, label: 'Đặt bàn', path: '/QuanLyDatBan' }
                    ]
                },
                {
                    id: 3, label: 'Sản phẩm', icon: CubeIcon,
                    children: [
                        { id: 31, label: 'Sản phẩm', path: '/QuanLySanPham' },
                        {
                            id: 32, label: 'Thành phần',
                            subChildren: [
                                { id: 321, label: 'Hạt cà phê', path: '/SanPhamHatCaPhe' },
                                { id: 322, label: 'Sữa', path: '/SanPhamSua' },
                                { id: 323, label: 'Kem béo', path: '/SanPhamkemBeo' },
                                { id: 324, label: 'Kem lạnh', path: '/SanPhamKem' },
                                { id: 325, label: 'Cách thức', path: '/QuanLyCachThuc' },
                                { id: 326, label: 'Topping', path: '/QuanLyTopping' },
                            ]
                        },
                    ]
                },
                { id: 6, label: 'Hóa đơn', icon: DocumentTextIcon, path: '/QuanLyHoaDon' },
                { id: 7, label: 'Đơn hàng', icon: AdjustmentsHorizontalIcon, path: '/QuanLyDonHang' },
            ]
        },
        {
            title: 'Quản lý hệ thống',
            items: [
                { id: 5, label: 'Khuyến mãi', icon: TicketIcon, path: '/QuanLyKhuyenMai' },
                {
                    id: 8, label: 'Tài khoản', icon: UserCircleIcon,
                    children: [
                        { id: 81, label: 'Nhân viên', icon: UserGroupIcon, path: '/QuanLyNhanVien' },
                        { id: 82, label: 'Khách hàng', icon: UsersIcon, path: '/QuanLyKhachHang' },
                    ]
                },
            ]
        }
    ]

    // Hàm tìm item theo path (hỗ trợ cả children và subChildren)
    const findMenuByPath = (path) => {
        for (const group of menuGroups) {
            for (const item of group.items) {
                // Kiểm tra item chính
                if (item.path === path) return item

                // Kiểm tra children
                if (item.children) {
                    for (const child of item.children) {
                        if (child.path === path) return child

                        // Kiểm tra subChildren
                        if (child.subChildren) {
                            for (const sub of child.subChildren) {
                                if (sub.path === path) return sub
                            }
                        }
                    }
                }
            }
        }
        return null
    }

    // Set active menu theo route hiện tại
    const setActiveFromRoute = () => {
        const currentPath = route.path
        const menuItem = findMenuByPath(currentPath)

        if (menuItem) {
            activeIndex.value = menuItem.id

            // Mở menu cha nếu có children
            if (menuItem.id.toString().length === 2) { // ví dụ: 31, 32, 81, 82...
                // Tìm item cha
                for (const group of menuGroups) {
                    for (const item of group.items) {
                        if (item.children) {
                            const child = item.children.find(c => c.id === menuItem.id)
                            if (child) {
                                openMenu.value = item.id
                                break
                            }
                        }
                    }
                }
            }

            // Mở sub menu nếu có subChildren
            if (menuItem.id.toString().length === 3) { // ví dụ: 321, 322...
                for (const group of menuGroups) {
                    for (const item of group.items) {
                        if (item.children) {
                            for (const child of item.children) {
                                if (child.subChildren) {
                                    const sub = child.subChildren.find(s => s.id === menuItem.id)
                                    if (sub) {
                                        openMenu.value = item.id
                                        openSub.value = child.id
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Logout
    const logout = async () => {
        await auth.logout()
        router.push('/login')
    }

    // Xử lý click menu
    function clickMenu(item) {
        activeIndex.value = item.id

        if (item.children) {
            openMenu.value = openMenu.value === item.id ? null : item.id
        } else {
            openMenu.value = null
        }

        if (item.path && route.path !== item.path) {
            router.push(item.path)
        }

        openSub.value = null
    }

    function clickSub(child) {
        activeIndex.value = child.id

        if (child.subChildren) {
            openSub.value = openSub.value === child.id ? null : child.id
        } else {
            openSub.value = null
            if (child.path) router.push(child.path)
        }
    }

    function clickSubChild(subChild) {
        activeIndex.value = subChild.id
        if (subChild.path) router.push(subChild.path)
    }

    // Theo dõi thay đổi route để cập nhật active
    watch(() => route.path, () => {
        setActiveFromRoute()
    }, { immediate: true })

    // Khởi tạo ban đầu
    onMounted(() => {
        setActiveFromRoute()
    })

    return {
        menuGroups,
        activeIndex,
        openMenu,
        openSub,
        logout,
        clickMenu,
        clickSub,
        clickSubChild
    }
}