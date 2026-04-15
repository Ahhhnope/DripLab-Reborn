// ============================================================
//  MenuView.js – DripLab Menu Logic
// ============================================================
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useCartStore } from '../../stores/cart' // Assuming standard path
import { useAuthStore } from '../Authorization/Auth'

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

  // 3. Fetch Data from CafeDB
  onMounted(async () => {
    try {
      const res = await api.get('/drinks/active')
      products.value = res.data.map(p => ({
        id: p.id,
        // Logic to categorize based on string matching from your DB
        categoryId: p.category?.toLowerCase().includes('trà') ? 'tea' : 'coffee',
        brand: 'DRIP LAB',
        name: p.name,
        price: p.basePrice,
        isHot: p.isHot || false,
        isNew: p.isNew || false,
        imageUrl: p.imageUrl 
      }))
    } catch (error) {
      console.error("Failed to fetch menu:", error)
    } finally {
      loading.value = false
    }
  })

  // 4. Filtering & Sorting Logic
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

  // 5. Action Handlers
  function setCategory(id) { activeCategoryId.value = id }
  function setSort(id) { activeSort.value = id }
  
  function formatVnd(v) {
    return v ? v.toLocaleString('vi-VN') + 'đ' : '0đ'
  }

  // Navigates to detail page (for customization)
  function goToProduct(p) {
    router.push({ name: 'user-product', params: { id: p.id } })
  }

  // POS-Style Quick Add
  async function quickAddToCart(p) {
    if (!authStore.user) {
      alert("Vui lòng đăng nhập để đặt món!");
      return;
    }

    try {
      cartStore.addToCart({
        userId: authStore.user.id,
        drinkId: p.id,
        sizeId: 1, // Defaulting to Size S per your DB script
        toppings: [], // Empty for quick add
        quantity: 1,
        sugar: '100%',
        ice: '100%'
      })
      alert(`Đã thêm ${p.name} vào giỏ hàng!`);
    } catch (error) {
      console.error("Quick add failed:", error)
      alert("Không thể thêm vào giỏ hàng.");
    }
  }

  const pageTitle = computed(() => {
    const c = categories.find((x) => x.id === activeCategoryId.value)
    return c?.label || 'Menu'
  })

  // 6. Return Exports
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
    // Change this line:
    addProduct: goToProduct, 
    openFromImage: goToProduct, 
    loading
  }
}