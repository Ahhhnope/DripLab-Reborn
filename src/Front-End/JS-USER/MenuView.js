import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import matchaNong from '../IMG/Matcha-latte.png'
import matchaLatte from '../IMG/Matcha_tea.jpg'
import capuchino from '../IMG/flat-white.jpg'
import mocha from '../IMG/mocha.jpg'
import geisha from '../IMG/geisha.png'
import phinden from '../IMG/phin_den.jpg'
import phinnau from '../IMG/phin_nau.jpg'
import bacsiu from '../IMG/bac_xiu.jpg'
import latte from '../IMG/coffee_latte.jpg'
import trasenvang from '../IMG/tra-sen-vang.jpg'
import trathachdao from '../IMG/tra-thach-dao.jpg'
import trathachvai from '../IMG/tra-vai.jpg'
import traxanhdaudo from '../IMG/tra-xanh-dau-do.jpg'
import tragung from '../IMG/tra-gung.jpg'
import hongtra from '../IMG/hong-tra-sua.jpg'


export function useMenuView() {
  const router = useRouter()

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'coffee', label: 'Cà phê' },
    { id: 'tea', label: 'Trà' },
  ]

  const activeCategoryId = ref('all')

  const sortOptions = [
    { id: 'name_asc', label: 'Tên A → Z' },
    { id: 'name_desc', label: 'Tên Z → A' },
    { id: 'price_asc', label: 'Giá tăng dần' },
    { id: 'price_desc', label: 'Giá giảm dần' },
    { id: 'newest', label: 'Hàng mới' },
  ]

  const activeSort = ref('name_asc')

  const products = ref([
    { id: 'phin-den', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Cà phê Phin Đen', price: 29000, isHot: true, isNew: false, imageUrl: phinden },
    { id: 'phin-nau', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Cà phê Phin Nâu', price: 29000, isHot: false, isNew: false, imageUrl: phinnau },
    { id: 'bac-xiu', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Bạc Xỉu Kem Xốp', price: 40000, isHot: false, isNew: true, imageUrl: bacsiu },
    { id: 'capuchino', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Capuchino', price: 35000, isHot: false, isNew: false, imageUrl: capuchino },
    { id: 'mocha', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Mocha', price: 35000, isHot: false, isNew: true, imageUrl: mocha },
    { id: 'geisha', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Geisha', price: 35000, isHot: true, isNew: false, imageUrl: geisha },
    { id: 'caffee-latte', categoryId: 'coffee', brand: 'DRIP LAB', name: 'Caffee Latte', price: 60000, isHot: false, isNew: true, imageUrl: latte },

    { id: 'matcha-latte', categoryId: 'tea', brand: 'DRIP LAB', name: 'Matcha Latte', price: 49000, isHot: true, isNew: false, imageUrl: matchaLatte },
    { id: 'matcha-nong', categoryId: 'tea', brand: 'DRIP LAB', name: 'Matcha Nóng', price: 49000, isHot: true, isNew: false, imageUrl: matchaNong },
    { id: 'tra-sen-vang', categoryId: 'tea', brand: 'DRIP LAB', name: 'Trà Sen Vàng', price: 45000, isHot: true, isNew: false, imageUrl: trasenvang },
    { id: 'tra-thach-dao', categoryId: 'tea', brand: 'DRIP LAB', name: 'Trà Thạch Đào', price: 45000, isHot: true, isNew: false, imageUrl: trathachdao },
    { id: 'tra-thach-vai', categoryId: 'tea', brand: 'DRIP LAB', name: 'Trà Thạch Vải', price: 45000, isHot: true, isNew: false, imageUrl: trathachvai },
    { id: 'tra-xanh-dau-do', categoryId: 'tea', brand: 'DRIP LAB', name: 'Trà Xanh Đậu Đỏ', price: 49000, isHot: true, isNew: false, imageUrl: traxanhdaudo },
    { id: 'tra-gung', categoryId: 'tea', brand: 'DRIP LAB', name: 'Trà gừng mật ong', price: 49000, isHot: true, isNew: false, imageUrl: tragung },
    { id: 'hong-tra-sua', categoryId: 'tea', brand: 'DRIP LAB', name: 'Hồng Trà Sữa', price: 49000, isHot: true, isNew: false, imageUrl: hongtra },
  ])

  function formatVnd(v) {
    return v.toLocaleString('vi-VN') + 'đ'
  }

  const filteredProducts = computed(() => {
    if (activeCategoryId.value === 'all') return products.value
    return products.value.filter((p) => p.categoryId === activeCategoryId.value)
  })

  const sortedProducts = computed(() => {
    const arr = [...filteredProducts.value]

    switch (activeSort.value) {
      case 'name_asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      case 'name_desc':
        return arr.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
      case 'price_asc':
        return arr.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return arr.sort((a, b) => b.price - a.price)
      case 'newest':
        return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew))
      default:
        return arr
    }
  })

  function setCategory(id) {
    activeCategoryId.value = id
  }

  function setSort(id) {
    activeSort.value = id
  }

  function addProduct(p) {
    router.push({ name: 'user-product', params: { id: p.id } })
  }

  function openFromImage(p) {
    window.scrollTo(0,0);
    
    router.push({
      name: 'user-product',
      params: { id: p.id },
    })
  }

  const pageTitle = computed(() => {
    const c = categories.find((x) => x.id === activeCategoryId.value)
    return c?.label || 'Menu'
  })

  return {
    categories,
    activeCategoryId,
    pageTitle,
    setCategory,

    sortOptions,
    activeSort,
    setSort,

    sortedProducts,
    formatVnd,
    addProduct,
    openFromImage,
  }
}