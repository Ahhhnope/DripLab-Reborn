import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Import icon từ heroicons
import { 
  HomeIcon, ShoppingCartIcon, CubeIcon, UsersIcon, 
  DocumentTextIcon, TicketIcon, NewspaperIcon, 
  UserCircleIcon, AdjustmentsHorizontalIcon, 
  ChartBarIcon, UserGroupIcon
} from '@heroicons/vue/24/outline'

export function useAdminMenu() {
    const activeIndex = ref(1)
    const openMenu = ref(null)
    const openSub = ref(null)
    const router = useRouter()

    // 1. ĐỔI TÊN THÀNH menuGroups VÀ CHIA NHÓM
    const menuGroups = [
        {
            title: 'Báo cáo & Phân tích',
            items: [
                { id: 1, label: 'Thống kê', icon: ChartBarIcon, path: '/' },
            ]
        },
        {
            title: 'Quản lý bán hàng',
            items: [
                { id: 2, label: 'Đơn tại quầy', icon: ShoppingCartIcon, path: '/QuanLyDonTaiQuay' },
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
                { id: 4, label: 'Tin tức', icon: NewspaperIcon, path: '/QuanLyTinTuc' },
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

    const logout = () => alert('Đăng xuất!')

    function clickMenu(item) {
        activeIndex.value = item.id
        if (item.children) {
            openMenu.value = openMenu.value === item.id ? null : item.id
        } else {
            openMenu.value = null
            if (item.path) router.push(item.path)
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

    // 2. RETURN ĐÚNG TÊN BIẾN menuGroups
    return { menuGroups, activeIndex, openMenu, openSub, logout, clickMenu, clickSub, clickSubChild }
}