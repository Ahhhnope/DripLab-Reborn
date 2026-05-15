// ============================================================
//  MenuView.js – DripLab Menu Logic (+ Search & Pagination)
// ============================================================
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../Authorization/Auth'

function getImageUrl(url) {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

// Danh sách 5 sản phẩm best seller
const BEST_SELLERS = [
  'cà phê phin nâu',
  'bạc xỉu',
  'trà đào',
  'matcha latte',
  'mocha',
]

export function useMenuView() {
  const router = useRouter()
  const cartStore = useCartStore()
  const authStore = useAuthStore()

  const products = ref([])
  const loading = ref(true)

  // 1. Category Setup
  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'coffee', label: 'Cà phê' },
    { id: 'tea', label: 'Trà' },
  ]

  const activeCategoryId = ref('all')
  const activeSort = ref('name_asc')

  // 2. Sorting Options
  const sortOptions = [
    { id: 'name_asc', label: 'Tên A → Z' },
    { id: 'name_desc', label: 'Tên Z → A' },
    { id: 'price_asc', label: 'Giá tăng dần' },
    { id: 'price_desc', label: 'Giá giảm dần' },
    { id: 'newest', label: 'Hàng mới' },
  ]

  // 3. Search State
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearchOpen = ref(false)
  const SEARCH_PREVIEW_LIMIT = 5

  // 4. Pagination State
  const currentPage = ref(1)
  const PAGE_SIZE = 9 // 3×3 grid

  // 5. Fetch Data from CafeDB
  onMounted(async () => {
    try {
      const res = await api.get('/drinks/active')
      products.value = res.data.map(p => ({
        id: p.id,
        categoryId: p.category?.toLowerCase().includes('trà') ? 'tea' : 'coffee',
        brand: 'DRIP LAB',
        name: p.name,
        price: p.basePrice,
        isHot: p.isHot || false,
        isNew: p.isNew || false,
        isBestSeller: BEST_SELLERS.some(s => p.name.toLowerCase().includes(s)),
        imageUrl: getImageUrl(p.imageUrl)
      }))
    } catch (error) {
      console.error("Failed to fetch menu:", error)
    } finally {
      loading.value = false
    }
  })

  // 6. Filtering & Sorting Logic
  const filteredProducts = computed(() => {
    if (activeCategoryId.value === 'all') return products.value
    return products.value.filter((p) => p.categoryId === activeCategoryId.value)
  })

  const sortedProducts = computed(() => {
    const arr = [...filteredProducts.value]
    switch (activeSort.value) {
      case 'name_asc': return arr.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      case 'name_desc': return arr.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
      case 'price_asc': return arr.sort((a, b) => a.price - b.price)
      case 'price_desc': return arr.sort((a, b) => b.price - a.price)
      case 'newest': return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew))
      default: return arr
    }
  })

  // 7. Search Logic
  watch(searchQuery, (q) => {
    const trimmed = q.trim().toLowerCase()
    if (!trimmed) {
      searchResults.value = []
      isSearchOpen.value = false
      return
    }
    searchResults.value = products.value.filter(p =>
      p.name.toLowerCase().includes(trimmed)
    )
    isSearchOpen.value = true
  })

  const previewResults = computed(() =>
    searchResults.value.slice(0, SEARCH_PREVIEW_LIMIT)
  )

  const hasMoreResults = computed(() =>
    searchResults.value.length > SEARCH_PREVIEW_LIMIT
  )

  const extraResultCount = computed(() =>
    searchResults.value.length - SEARCH_PREVIEW_LIMIT
  )

  function closeSearch() {
    isSearchOpen.value = false
  }

  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
    isSearchOpen.value = false
  }

  // 8. Pagination Logic
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(sortedProducts.value.length / PAGE_SIZE))
  )

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return sortedProducts.value.slice(start, start + PAGE_SIZE)
  })

  // Reset page when category/sort/search changes
  watch([activeCategoryId, activeSort], () => {
    currentPage.value = 1
  })

  function goToPage(n) {
    if (n < 1 || n > totalPages.value) return
    currentPage.value = n
  }

  // Visible page numbers (max 5 around current)
  const visiblePages = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages = new Set([1, total])
    for (let i = Math.max(2, cur - 2); i <= Math.min(total - 1, cur + 2); i++) {
      pages.add(i)
    }
    const sorted = [...pages].sort((a, b) => a - b)
    // Insert ellipsis markers as null
    const result = []
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null)
      result.push(sorted[i])
    }
    return result
  })

  // 9. Action Handlers
  function setCategory(id) {
    activeCategoryId.value = id
    currentPage.value = 1
  }

  function setSort(id) {
    activeSort.value = id
    currentPage.value = 1
  }

  function formatVnd(v) {
    return v ? v.toLocaleString('vi-VN') + 'đ' : '0đ'
  }

  function goToProduct(p) {
    router.push({ name: 'user-product', params: { id: p.id } })
  }

  async function quickAddToCart(p) {
    if (!authStore.user) {
      alert("Vui lòng đăng nhập để đặt món!")
      return
    }
    try {
      cartStore.addToCart({
        userId: authStore.user.id,
        drinkId: p.id,
        sizeId: 1,
        toppings: [],
        quantity: 1,
        sugar: '100%',
        ice: '100%'
      })
      alert(`Đã thêm ${p.name} vào giỏ hàng!`)
    } catch (error) {
      console.error("Quick add failed:", error)
      alert("Không thể thêm vào giỏ hàng.")
    }
  }

  const pageTitle = computed(() => {
    const c = categories.find((x) => x.id === activeCategoryId.value)
    return c?.label || 'Menu'
  })

  // 10. Return Exports
  return {
    categories,
    activeCategoryId,
    pageTitle,
    setCategory,
    sortOptions,
    activeSort,
    setSort,
    // Paginated products (replaces sortedProducts for the grid)
    sortedProducts: paginatedProducts,
    // Pagination
    currentPage,
    totalPages,
    visiblePages,
    goToPage,
    // Search
    searchQuery,
    previewResults,
    hasMoreResults,
    extraResultCount,
    isSearchOpen,
    closeSearch,
    clearSearch,
    formatVnd,
    addProduct: goToProduct,
    openFromImage: goToProduct,
    loading
  }
}