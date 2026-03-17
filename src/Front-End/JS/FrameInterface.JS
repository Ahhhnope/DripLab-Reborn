import { ref } from 'vue'

export function useAdminMenu() {
    const activeIndex = ref(1)
    const openMenu = ref(null)
    const openSub = ref(null)

    const menuItems = [
        { id: 1, label: 'Quản lý thống kê' },
        { id: 2, label: 'Đơn tại quầy' },
        {
            id: 3, label: 'Quản lý sản phẩm',
            children: [
                { id: 31, label: 'Sản phẩm' },
                {
                    id: 32, label: 'Thành phần',
                    subChildren: [
                        { id: 321, label: 'Hạt cà phê' },
                        { id: 322, label: 'Sữa' },
                        { id: 323, label: 'Kem béo' },
                        { id: 324, label: 'Kem lạnh' },
                        { id: 325, label: 'Cách thức' },
                    ]
                },
            ]
        },
        { id: 4, label: 'Quản lý tin tức' },
        { id: 5, label: 'Quản lý khuyến mãi' },
        { id: 6, label: 'Quản lý hóa đơn' },
        { id: 7, label: 'Quản lý đơn hàng' },
        {
            id: 8, label: 'Quản lý tài khoản',
            children: [
                { id: 81, label: 'Quản lý nhân viên' },
                { id: 82, label: 'Quản lý khách hàng' },
            ]
        },
    ]

    const logout = () => alert('Đăng xuất!')

    return { menuItems, activeIndex, openMenu, openSub, logout }
}