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

    // Cấu trúc menu chia theo Group
    const menuGroups = [
        {
            title: 'Báo cáo & Phân tích',
            items: [
                { id: 1, label: 'Thống Kê', icon: ChartBarIcon, path: '/' },
            ]
        },
        {
            title: 'Quản lý bán hàng',
            items: [
                { id: 2, label: 'Đơn tại quầy', icon: ShoppingCartIcon, path: '/QuanLyDonTaiQuay' },
                { 
                    id: 3, label: 'Sản phẩm', icon: CubeIcon,
                    children: [
                        { id: 31, label: 'Danh sách sản phẩm', path: '/QuanLySanPham' },
                        { 
                            id: 32, label: 'Thuộc tính', 
                            subChildren: [
                                { id: 321, label: 'Hạt cà phê', path: '/HatCaPhe' },
                                { id: 322, label: 'Sữa', path: '/Sua' },
                                { id: 325, label: 'Cách thức', path: '/CachThuc' },
                            ] 
                        },
                    ]
                },
                { id: 6, label: 'Hóa đơn', icon: DocumentTextIcon, path: '/QuanLyHoaDon' },
                { id: 7, label: 'Đơn hàng', icon: AdjustmentsHorizontalIcon, path: '/QuanLyDonHang' },
            ]
        },
        {
            title: 'Quản lý giảm giá',
            items: [
                { id: 5, label: 'Phiếu giảm giá', icon: TicketIcon, path: '/QuanLyKhuyenMai' },
                { id: 4, label: 'Tin tức', icon: NewspaperIcon, path: '/QuanLyTinTuc' },
            ]
        },
        {
            title: 'Quản lý hệ thống',
            items: [
                { 
                    id: 8, label: 'Tài khoản', icon: UserCircleIcon,
                    children: [
                        { id: 81, label: 'Nhân viên', path: '/QuanLyNhanVien' },
                        { id: 82, label: 'Khách hàng', path: '/QuanLyKhachHang' },
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

    return { menuGroups, activeIndex, openMenu, openSub, logout, clickMenu, clickSub, clickSubChild }
}