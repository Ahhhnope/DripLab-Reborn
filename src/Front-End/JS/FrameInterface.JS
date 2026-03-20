import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Import icon từ heroicons
import { 
  HomeIcon, ShoppingCartIcon, CubeIcon, UsersIcon, 
  DocumentTextIcon, TicketIcon, NewspaperIcon, 
  UserCircleIcon, AdjustmentsHorizontalIcon, 
  ChartBarIcon
} from '@heroicons/vue/24/outline'

export function useAdminMenu() {
    const activeIndex = ref(1)
    const openMenu = ref(null)
    const openSub = ref(null)
    const router = useRouter()

    const menuItems = [
        { id: 1, label: 'Quản lý thống kê', path: '/' },
        { id: 2, label: 'Đơn tại quầy', path: '/QuanLyDonTaiQuay' },
        {
            id: 3, label: 'Quản lý sản phẩm',
            children: [
                { id: 31, label: 'Sản phẩm', path: '/QuanLySanPham' },
                {
                    id: 32, label: 'Thành phần',
                    subChildren: [
                        { id: 321, label: 'Hạt cà phê', path: '/HatCaPhe' },
                        { id: 322, label: 'Sữa', path: '/Sua' },
                        { id: 323, label: 'Kem béo', path: '/KemBeo' },
                        { id: 324, label: 'Kem lạnh', path: '/KemLanh' },
                        { id: 325, label: 'Cách thức', path: '/CachThuc' },
                    ]
                },
            ]
        },
        { id: 4, label: 'Quản lý tin tức', path: '/QuanLyTinTuc' },
        { id: 5, label: 'Quản lý khuyến mãi', path: '/QuanLyKhuyenMai' },
        { id: 6, label: 'Quản lý hóa đơn', path: '/QuanLyHoaDon' },
        { id: 7, label: 'Quản lý đơn hàng', path: '/QuanLyDonHang' },
        {
            id: 8, label: 'Quản lý tài khoản',
            children: [
                { id: 81, label: 'Quản lý nhân viên', path: '/QuanLyNhanVien' },
                { id: 82, label: 'Quản lý khách hàng', path: '/QuanLyKhachHang' },
            ]
        },
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

    return { menuGroups, activeIndex, openMenu, openSub, logout, clickMenu, clickSub, clickSubChild }
}