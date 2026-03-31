import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Nếu bạn muốn dùng ảnh local trong src/Front-End/IMG:
import matchaNong from '../IMG/Matcha-latte.png'
import matchaLatte from '../IMG/Matcha_tea.jpg'
import capuchino from '../IMG/flat-white.jpg'
import mocha from '../IMG/mocha.jpg'
import geisha from '../IMG/geisha.png'
import phinden from '../IMG/phin_den.jpg'
import phinnau from '../IMG/phin_nau.jpg'
import coldbrew from '../IMG/Cold Brew.jpg'
import coldbrewmatong from '../IMG/cold_brew_mat_ong.jpg'
import coldbrewvaihong from '../IMG/cold_brew_vai_hong.jpg'
import bacsiu from '../IMG/bac_xiu.jpg'
import latte from '../IMG/coffee_latte.jpg'

export function useMenuView() {
  const router = useRouter()

  const pageTitle = ref('Cà Phê')

  const sortOptions = [
    { id: 'name_asc', label: 'Tên A → Z' },
    { id: 'name_desc', label: 'Tên Z → A' },
    { id: 'price_asc', label: 'Giá tăng dần' },
    { id: 'price_desc', label: 'Giá giảm dần' },
    { id: 'newest', label: 'Hàng mới' },
  ]
  const activeSort = ref('name_asc')

  const products = ref([
    {
      id: 'matcha-nong',
      brand: 'Drip Lab',
      name: 'Matcha Nóng',
      price: 49000,
      isHot: true,
      isNew: false,
      imageUrl: matchaNong,
    },
    {
      id: 'matcha-latte',
      brand: 'Drip Lab',
      name: 'Matcha Latte',
      price: 49000,
      isHot: true,
      isNew: false,
      imageUrl: matchaLatte,
    },
    {
      id: 'capuchino',
      brand: 'Drip Lab',
      name: 'Capuchino',
      price: 35000,
      isHot: false,
      isNew: false,
      imageUrl: capuchino,
    },
    {
      id: 'mocha',
      brand: 'Drip Lab',
      name: 'Mocha',
      price: 35000,
      isHot: false,
      isNew: true,
      imageUrl: mocha,
    },
    {
      id: 'geisha',
      brand: 'Drip Lab',
      name: 'Geisha',
      price: 35000,
      isHot: true,
      isNew: false,
      imageUrl: geisha,
    },
    {
      id: 'phin-den',
      brand: 'Drip Lab',
      name: 'Cà phê Phin Đen',
      price: 29000,
      isHot: true,
      isNew: false,
      imageUrl: phinden,
    },
    {
      id: 'phin-nau',
      brand: 'Drip Lab',
      name: 'Cà phê Phin Nâu',
      price: 29000,
      isHot: false,
      isNew: false,
      imageUrl: phinnau,
    },
    {
      id: 'bac-xiu',
      brand: 'Drip Lab',
      name: 'Bạc Xỉu Kem Xốp',
      price: 40000,
      isHot: false,
      isNew: true,
      imageUrl: bacsiu,
    },
    {
      id: 'cold-brew-normal',
      brand: 'Drip Lab',
      name: 'Cold Brew Nguyên Bản',
      price: 50000,
      isHot: true,
      isNew: false,
      imageUrl: coldbrew,
    },
    {
      id: 'cold-brew-mat-ong',
      brand: 'Drip Lab',
      name: 'Cold Brew Mật Ong',
      price: 55000,
      isHot: true,
      isNew: false,
      imageUrl: coldbrewmatong,
    },
    {
      id: 'cold-brew-vai-hong',
      brand: 'Drip Lab',
      name: 'Cold Brew Vải Hồng',
      price: 55000,
      isHot: false,
      isNew: false,
      imageUrl: coldbrewvaihong,
    },
    {
      id: 'caffee-latte',
      brand: 'Drip Lab',
      name: 'Caffee Latte',
      price: 60000,
      isHot: false,
      isNew: true,
      imageUrl: latte,
    },
  ])

  function formatVnd(v) {
    return v.toLocaleString('vi-VN') + 'đ'
  }

  const sortedProducts = computed(() => {
    const arr = [...products.value]
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

  function setSort(id) {
    activeSort.value = id
  }

  // ✅ Bấm nút "+" đi thẳng vào chi tiết
  function addProduct(p) {
    router.push({ name: 'user-product', params: { id: p.id } })
  }

  // ✅ Bấm vào ảnh -> Đi vào chi tiết kèm query ?preview=1
  function openFromImage(p) {
    router.push({
      name: 'user-product',
      params: { id: p.id },
      query: { preview: '1' }, 
    })
  }

  return {
    pageTitle,
    sortOptions,
    activeSort,
    setSort,
    sortedProducts,
    formatVnd,
    addProduct,
    openFromImage,
  }
}