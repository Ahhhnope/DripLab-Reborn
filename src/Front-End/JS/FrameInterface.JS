import { ref } from 'vue'

export function useAdminMenu() {
    const activeIndex = ref(1)

    const menuItems = [
        { id: 1, label: 'Quản lý thống kê' },
        { id: 2, label: 'Đơn tại quầy' },
        { id: 3, label: 'Quản lý sản phẩm' },
        { id: 4, label: 'Quản lý tin tức' },
        { id: 5, label: 'Quản lý khuyến mãi' },
        { id: 6, label: 'Quản lý hóa đơn' },
        { id: 7, label: 'Quản lý Đơn hàng' },
        { id: 8, label: 'Quản lý nhân viên' },
        { id: 9, label: 'Quản lý khách hàng' },

    ]

    const setActive = (id) => activeIndex.value = id
    const isActive = (id) => activeIndex.value === id
    const logout = () => alert('Đăng xuất!')

    return { menuItems, setActive, isActive, logout, activeIndex }
}