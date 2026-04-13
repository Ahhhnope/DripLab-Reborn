<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/axios'

// ✅ STORES
import { useCartStore } from '../../stores/cart.js'
import { useAuthStore } from '../Authorization/Auth.js'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// --- UI STATE ---
const product = ref(null)
const loading = ref(true)
const qty = ref(1)
const showPreview = ref(false)

// --- NOTIFICATION STATE ---
const notice = reactive({
  open: false,
  type: 'info',
  title: '',
  message: '',
  buttonText: 'Hoàn tất',
  onClose: null,
})

// --- SELECTIONS ---
const selections = reactive({
  sugar: '100%', 
  ice: '100%',   
  cup: 'cup_plastic',
  toppings: new Set(),
})

// --- OPTIONS (Sync with CafeDB) ---
const sugarItems = ['0%', '30%', '50%', '70%', '100%']
const iceItems = ['0%', '30%', '50%', '70%', '100%']
const toppingItems = [
  { id: 1, label: 'Trân châu Đen', price: 5000 },
  { id: 2, label: 'Trân Châu Ngọc Trai', price: 5000 },
  { id: 3, label: 'Thạch cà phê', price: 5000 },
  { id: 4, label: 'Kem cheese đặc', price: 10000 },
  { id: 5, label: 'Kem béo', price: 6000 },
]

// --- FETCH DATA ---
onMounted(async () => {
  try {
    const id = route.params.id
    // Fetch directly from your CafeDB API
    const res = await api.get(`/drinks/${id}`)
    product.value = res.data
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error)
    showNotice({ 
      type: 'error', 
      title: 'Lỗi', 
      message: 'Không tìm thấy sản phẩm này hoặc server mất kết nối.' 
    })
  } finally {
    loading.value = false
  }
})

// --- CALCULATIONS ---
const lineTotal = computed(() => {
  if (!product.value) return 0
  let toppingExtra = 0
  selections.toppings.forEach(id => {
    const t = toppingItems.find(x => x.id === id)
    if (t) toppingExtra += t.price
  })
  // basePrice comes from your Database
  return (product.value.basePrice + toppingExtra) * qty.value
})

// --- ACTIONS ---
function toggleTopping(id) {
  if (selections.toppings.has(id)) {
    selections.toppings.delete(id)
  } else {
    if (selections.toppings.size >= 3) {
      showNotice({ type: 'warning', title: 'Thông báo', message: 'Tối đa 3 loại topping!' })
      return
    }
    selections.toppings.add(id)
  }
}

async function handleAddToCart() {
  const userId = authStore.user?.id
  
  if (!userId) {
    showNotice({ 
      type: 'warning', 
      title: 'Chưa đăng nhập', 
      message: 'Vui lòng đăng nhập để thêm món vào giỏ hàng.', 
      onClose: () => router.push('/login') 
    })
    return
  }

  const payload = {
    userId: userId,
    drinkId: product.value.id,
    quantity: qty.value,
    sizeId: 1, // Defaulting to Size S for Online orders
    sugar: selections.sugar,
    ice: selections.ice,
    toppings: Array.from(selections.toppings)
  }

  try {
    // Calls your Pinia store action
    await cartStore.addToCart(payload)
    showNotice({
      type: 'success',
      title: 'Tuyệt vời!',
      message: `Đã thêm ${product.value.name} vào giỏ hàng.`,
      buttonText: 'Xem giỏ hàng',
      onClose: () => router.push('/cart')
    })
  } catch (e) {
    showNotice({ type: 'error', title: 'Lỗi', message: 'Lỗi kết nối giỏ hàng.' })
  }
}

// --- HELPERS ---
function formatVnd(v) { return (v || 0).toLocaleString('vi-VN') + 'đ' }

function showNotice(params) {
  Object.assign(notice, { open: true, ...params })
}

function closeNotice() { 
  notice.open = false
  if (notice.onClose) {
    notice.onClose()
    notice.onClose = null
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-[#FDFCFB] pb-20">
    <div v-if="loading" class="flex h-screen items-center justify-center text-slate-400 font-medium">
      <span class="animate-pulse text-2xl">☕ Đang pha chế...</span>
    </div>
    
    <div v-else class="mx-auto max-w-6xl px-4 py-8">
      <button @click="router.back()" class="group mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm group-hover:bg-slate-100">‹</div>
        <span class="font-bold text-sm uppercase tracking-widest">Quay lại</span>
      </button>

      <div class="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div class="md:col-span-5">
          <div class="sticky top-10 group overflow-hidden rounded-3xl shadow-2xl cursor-zoom-in" @click="showPreview = true">
            <img :src="product.imageUrl" class="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-0 p-8 text-white">
              <span class="bg-[#3eb06b] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-2 inline-block">Món mới</span>
              <h1 class="text-4xl font-black leading-none uppercase">{{ product.name }}</h1>
              <p class="mt-2 text-2xl font-light opacity-90">{{ formatVnd(product.basePrice) }}</p>
            </div>
          </div>
        </div>

        <div class="md:col-span-7 space-y-10">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-100 pb-10">
            <section>
              <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Mức đường</h3>
              <div class="flex flex-wrap gap-2">
                <button v-for="s in sugarItems" :key="s" 
                  @click="selections.sugar = s"
                  class="px-4 py-2 rounded-xl text-sm font-bold border-2 transition"
                  :class="selections.sugar === s ? 'border-[#126b23] bg-[#126b23] text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'">
                  {{ s }}
                </button>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Mức đá</h3>
              <div class="flex flex-wrap gap-2">
                <button v-for="i in iceItems" :key="i" 
                  @click="selections.ice = i"
                  class="px-4 py-2 rounded-xl text-sm font-bold border-2 transition"
                  :class="selections.ice === i ? 'border-[#126b23] bg-[#126b23] text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'">
                  {{ i }}
                </button>
              </div>
            </section>
          </div>

          <section>
            <div class="flex justify-between items-end mb-6">
              <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Topping yêu thích</h3>
              <span class="text-[10px] font-bold text-slate-300">TỐI ĐA 03 LOẠI</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="t in toppingItems" :key="t.id" 
                @click="toggleTopping(t.id)"
                class="flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition"
                :class="selections.toppings.has(t.id) ? 'border-[#126b23] bg-green-50' : 'border-slate-50 hover:border-slate-200'">
                <div class="flex items-center gap-3">
                  <div class="h-4 w-4 rounded-full border-2 flex items-center justify-center" :class="selections.toppings.has(t.id) ? 'bg-[#126b23] border-[#126b23]' : 'border-slate-200'">
                    <span v-if="selections.toppings.has(t.id)" class="text-[8px] text-white">✓</span>
                  </div>
                  <span class="text-sm font-bold text-slate-700">{{ t.label }}</span>
                </div>
                <span class="text-xs font-medium text-slate-400">+{{ formatVnd(t.price) }}</span>
              </div>
            </div>
          </section>

          <div class="pt-10 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
            <div class="flex items-center gap-6 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm">
              <button @click="qty = Math.max(1, qty - 1)" class="text-2xl font-light text-slate-300 hover:text-slate-900 transition"> − </button>
              <span class="text-xl font-black w-8 text-center">{{ qty }}</span>
              <button @click="qty++" class="text-2xl font-light text-slate-300 hover:text-slate-900 transition"> + </button>
            </div>
            
            <button @click="handleAddToCart" class="flex-1 min-w-[240px] bg-[#126b23] text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-[#0f541b] active:scale-95 transition">
              Thêm vào giỏ • {{ formatVnd(lineTotal) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="notice.open" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="closeNotice">
        <div class="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">
              {{ notice.type === 'success' ? '✨' : notice.type === 'warning' ? '👀' : '⚠️' }}
            </span>
          </div>
          <h2 class="text-2xl font-black text-slate-900 mb-2 uppercase">{{ notice.title }}</h2>
          <p class="text-slate-500 font-medium leading-relaxed mb-8">{{ notice.message }}</p>
          <button @click="closeNotice" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition">
            {{ notice.buttonText }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>