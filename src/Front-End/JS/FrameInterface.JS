import { ref } from 'vue'

export function useAdminMenu() {
  const activeIndex = ref(1)

  const menuItems = [
    { id: 1, label: 'Quản lý thống kê' },
    { id: 2, label: 'Đơn tại quầy' },
    { id: 3, label: 'Quản lý sản phẩm' },
    { id: 4, label: 'Quản lý tin tức' },
    { id: 5, label: 'Quản lí khuyến mãi' },
  ]

  const setActive = (id) => activeIndex.value = id
  const isActive = (id) => activeIndex.value === id
  const logout = () => alert('Đăng xuất!')

  return { menuItems, setActive, isActive, logout }
}