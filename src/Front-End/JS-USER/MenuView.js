import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Ảnh local
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

  const categories = [
    { id: 'all', label: 'Tất cả', iconKey: 'all', children: [{ id: 'all', label: 'Tất cả sản phẩm' }] },
    {
      id: 'coffee',
      label: 'Cà phê',
      iconKey: 'coffee',
      children: [
        { id: 'phin-da', label: 'Phin đá' },
        { id: 'phin-sua', label: 'Phin sữa' },
      ],
    },
    {
      id: 'tea',
      label: 'Trà',
      iconKey: 'tea',
      children: [
        { id: 'matcha', label: 'Matcha Latte' },
        { id: 'matcha-nong', label: 'Matcha nóng' },
      ],
    },
    {
      id: 'coldbrew',
      label: 'Cold Brew',
      iconKey: 'coldbrew',
      children: [{ id: 'cold-brew', label: 'Cold Brew' }],
    },
  ]

  const activeSubId = ref('all')

  // dropdown state
  const isCatOpen = ref(false)
  function toggleCatMenu() {
    isCatOpen.value = !isCatOpen.value
  }
  function closeCatMenu() {
    isCatOpen.value = false
  }

  const products = ref([
    // Coffee - phin đá
    { id: 'phin-den', subId: 'phin-da', brand: 'DRIP LABB', name: 'Cà phê Phin Đen', price: 29000, isHot: true, isNew: false, imageUrl: phinden },
    { id: 'geisha', subId: 'phin-da', brand: 'DRIP LABB', name: 'Geisha', price: 35000, isHot: true, isNew: false, imageUrl: geisha },
    { id: 'capuchino', subId: 'phin-da', brand: 'DRIP LABB', name: 'Capuchino', price: 35000, isHot: false, isNew: false, imageUrl: capuchino },

    // Coffee - phin sữa
    { id: 'phin-nau', subId: 'phin-sua', brand: 'DRIP LABB', name: 'Cà phê Phin Nâu', price: 29000, isHot: false, isNew: false, imageUrl: phinnau },
    { id: 'bac-xiu', subId: 'phin-sua', brand: 'DRIP LABB', name: 'Bạc Xỉu Kem Xốp', price: 40000, isHot: false, isNew: true, imageUrl: bacsiu },
    { id: 'mocha', subId: 'phin-sua', brand: 'DRIP LABB', name: 'Mocha', price: 35000, isHot: false, isNew: true, imageUrl: mocha },
    { id: 'caffee-latte', subId: 'phin-sua', brand: 'DRIP LABB', name: 'Caffee Latte', price: 60000, isHot: false, isNew: true, imageUrl: latte },

    // Cold Brew
    { id: 'cold-brew-normal', subId: 'cold-brew', brand: 'DRIP LABB', name: 'Cold Brew', price: 50000, isHot: true, isNew: false, imageUrl: coldbrew },
    { id: 'cold-brew-mat-ong', subId: 'cold-brew', brand: 'DRIP LABB', name: 'Cold Brew Mật Ong', price: 55000, isHot: true, isNew: false, imageUrl: coldbrewmatong },
    { id: 'cold-brew-vai-hong', subId: 'cold-brew', brand: 'DRIP LABB', name: 'Cold Brew Vải Hồng', price: 55000, isHot: false, isNew: false, imageUrl: coldbrewvaihong },

    // Tea
    { id: 'matcha-latte', subId: 'matcha', brand: 'DRIP LABB', name: 'Matcha Latte', price: 49000, isHot: true, isNew: false, imageUrl: matchaLatte },
    { id: 'matcha-nong', subId: 'matcha-nong', brand: 'DRIP LABB', name: 'Matcha Nóng', price: 49000, isHot: true, isNew: false, imageUrl: matchaNong },
  ])

  function formatVnd(v) {
    return v.toLocaleString('vi-VN') + 'đ'
  }

  const activeTitle = computed(() => {
    if (activeSubId.value === 'all') return 'Tất cả sản phẩm'
    for (const c of categories) {
      const sub = c.children.find((x) => x.id === activeSubId.value)
      if (sub) return sub.label
    }
    return 'MENU'
  })

  const filteredProducts = computed(() => {
    if (activeSubId.value === 'all') return products.value
    return products.value.filter((p) => p.subId === activeSubId.value)
  })

  function selectSub(id) {
    activeSubId.value = id
    isCatOpen.value = false
    return true
  }

  function addProduct(p) {
    router.push({ name: 'user-product', params: { id: p.id } })
  }

  function openFromImage(p) {
    router.push({
      name: 'user-product',
      params: { id: p.id },
      query: { preview: '1' },
    })
  }

  return {
    categories,
    activeSubId,
    activeTitle,

    isCatOpen,
    toggleCatMenu,
    closeCatMenu,

    selectSub,

    filteredProducts,
    formatVnd,
    addProduct,
    openFromImage,
  }
}
