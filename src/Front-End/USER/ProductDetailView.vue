<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ✅ 1. IMPORT ẢNH LOCAL GIỐNG HỆT MENUVIEW.JS
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

const route = useRoute()
const router = useRouter()

// --- 2. LOGIC MODAL PREVIEW ---
const showPreview = ref(false)

watchEffect(() => {
  showPreview.value = route.query.preview === '1'
})

function closePreview() {
  showPreview.value = false
  router.replace({ query: { ...route.query, preview: undefined } })
}

// --- 3. DATA SẢN PHẨM ĐÃ ĐỒNG BỘ VỚI MENUVIEW.JS ---
const products = [
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    price: 49000,
    imageUrl: matchaLatte,
  },
  {
    id: 'matcha-nong',
    name: 'Matcha Nóng',
    price: 49000,
    imageUrl: matchaNong,
  },
  {
    id: 'capuchino',
    name: 'Capuchino',
    price: 35000,
    imageUrl: capuchino,
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: 35000,
    imageUrl: mocha,
  },
  {
    id: 'geisha',
    name: 'Geisha',
    price: 35000,
    imageUrl: geisha,
  },
  {
    id: 'phin-den',
    name: 'Cà phê Phin Đen',
    price: 29000,
    imageUrl: phinden,
  },
  {
    id: 'phin-nau',
    name: 'Cà phê Phin Nâu',
    price: 29000,
    imageUrl: phinnau,
  },
  {
    id: 'bac-xiu',
    name: 'Bạc Xỉu Kem Xốp',
    price: 40000,
    imageUrl: bacsiu,
  },
  {
    id: 'cold-brew-normal',
    name: 'Cold Brew Nguyên Bản',
    price: 50000,
    imageUrl: coldbrew,
  },
  {
    id: 'cold-brew-mat-ong',
    name: 'Cold Brew Mật Ong',
    price: 55000,
    imageUrl: coldbrewmatong,
  },
  {
    id: 'cold-brew-vai-hong',
    name: 'Cold Brew Vải Hồng',
    price: 55000,
    imageUrl: coldbrewvaihong,
  },
  {
    id: 'caffee-latte',
    name: 'Caffee Latte',
    price: 60000,
    imageUrl: latte,
  },
]

// Lấy sản phẩm dựa trên ID trên URL (Mặc định 'phin-sua-da' nếu mở trực tiếp không có ID)
const productId = computed(() => String(route.params.id || 'phin-sua-da'))
const product = computed(() => products.find((p) => p.id === productId.value))

// --- 4. OPTIONS & GROUPS ---
const groups = computed(() => [
  {
    id: 'sugar_ice',
    title: 'MỨC ĐƯỜNG - MỨC ĐÁ',
    type: 'multi',
    max: 2,
    items: [
      { id: 'sugar_0', label: '0% đường', priceDelta: 0 },
      { id: 'sugar_50', label: '50% đường', priceDelta: 0 },
      { id: 'sugar_100', label: '100% đường', priceDelta: 0 },
      { id: 'ice_0', label: '0% đá', priceDelta: 0 },
      { id: 'ice_50', label: '50% đá', priceDelta: 0 },
      { id: 'ice_100', label: '100% đá', priceDelta: 0 },
    ],
  },
  {
    id: 'cup',
    title: 'CỐC',
    type: 'single',
    max: 1,
    items: [
      { id: 'cup_paper', label: 'Cốc giấy', priceDelta: 0 },
      { id: 'cup_plastic', label: 'Cốc nhựa', priceDelta: 0 },
    ],
  },
  {
    id: 'topping',
    title: 'TOPPING',
    type: 'multi',
    max: 3,
    items: [
      { id: 'top_1', label: 'Trân châu Đen', priceDelta: 5000 },
      { id: 'top_2', label: 'Trân Châu Ngọc Trai', priceDelta: 5000 },
      { id: 'top_3', label: 'Thạch cà phê', priceDelta: 5000 },
      { id: 'top_4', label: 'Kem cheese đặc', priceDelta: 10000 },
      { id: 'top_5', label: 'Kem béo', priceDelta: 6000 },
      { id: 'top_6', label: 'Pudding trứng', priceDelta: 8000 },
      { id: 'top_7', label: 'Machiato', priceDelta: 5000 },
      { id: 'top_8', label: 'Whipping cream', priceDelta: 8000 },
    ],
  },
])

// Mặc định chọn Cốc Nhựa
const selections = reactive({
  cup: new Set(['cup_plastic'])
})
const qty = ref(1)

function selectSingle(groupId, itemId) {
  selections[groupId] = new Set([itemId])
}

function toggleMulti(groupId, itemId, max) {
  if (!selections[groupId]) selections[groupId] = new Set()
  const set = selections[groupId]

  if (set.has(itemId)) {
    set.delete(itemId)
  } else {
    if (set.size < max) set.add(itemId) 
  }
}

const isChecked = (gId, iId) => selections[gId]?.has(iId)
const formatVnd = (v) => v.toLocaleString('vi-VN') + 'đ'

const lineTotal = computed(() => {
  let optionPrice = 0
  Object.entries(selections).forEach(([gId, set]) => {
    const group = groups.value.find(g => g.id === gId)
    set.forEach(itemId => {
      const item = group?.items.find(i => i.id === itemId)
      if (item) optionPrice += item.priceDelta
    })
  })
  return ((product.value?.price || 0) + optionPrice) * qty.value
})
</script>

<template>
  <div class="relative min-h-screen bg-white pb-20">
    
    <div class="mx-auto max-w-6xl px-4 py-6">
      <button class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300/50 text-slate-500 hover:bg-slate-300 transition" @click="router.back()">
        <span class="text-xl leading-none -translate-y-px">‹</span>
      </button>
    </div>

    <div class="mx-auto max-w-6xl px-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        <div class="md:col-span-5 relative">
          <div class="sticky top-10 overflow-hidden rounded-2xl shadow-lg cursor-pointer" @click="showPreview = true">
            
            <img v-if="product" :src="product.imageUrl" class="w-full aspect-4/5 object-cover" alt="Product Image" />
            
            <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
            
            <div class="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                {{ product?.name }}
              </h1>
              <p class="mt-2 text-lg font-bold text-[#3eb06b] drop-shadow-md">
                Giá: {{ formatVnd(product?.price || 0) }}
              </p>
            </div>
            
          </div>
        </div>

        <div class="md:col-span-7 pb-10">
          <div class="space-y-8">
            
            <div v-for="g in groups" :key="g.id" class="border-b border-slate-100 pb-8 last:border-0">
              
              <div class="flex items-center gap-2 mb-6">
                <span class="text-base font-bold text-slate-800 uppercase tracking-wide">{{ g.title }}</span>
                <span class="text-xs font-medium text-slate-400">• tối đa {{ g.max }}</span>
              </div>

              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <label v-for="it in g.items" :key="it.id" class="flex cursor-pointer items-start gap-3 group">
                  
                  <input 
                    :type="g.type === 'single' ? 'radio' : 'checkbox'" 
                    :name="g.id"
                    :checked="isChecked(g.id, it.id)" 
                    @change="g.type === 'single' ? selectSingle(g.id, it.id) : toggleMulti(g.id, it.id, g.max)" 
                    class="mt-1 h-4.5 w-4.5 accent-[#126b23] cursor-pointer" 
                  />
                  
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-800 group-hover:text-black transition-colors">{{ it.label }}</span>
                    <span class="text-xs font-medium text-slate-400 mt-0.5">
                      {{ it.priceDelta > 0 ? formatVnd(it.priceDelta) : '0đ' }}
                    </span>
                  </div>
                  
                </label>
              </div>

            </div>
          </div>

          <div class="mt-8 flex items-center justify-between border-t border-slate-100 pt-8">
            
            <div class="flex items-center gap-3">
              <button @click="qty = Math.max(1, qty - 1)" class="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-lg font-medium text-slate-600 hover:bg-slate-200 transition">
                −
              </button>
              <span class="w-6 text-center text-base font-semibold text-slate-900">{{ qty }}</span>
              <button @click="qty++" class="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-lg font-medium text-slate-600 hover:bg-slate-200 transition">
                +
              </button>
            </div>

            <button class="rounded-lg bg-[#126b23] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0f541b]">
              Thêm vào giỏ • +{{ formatVnd(lineTotal) }}
            </button>
            
          </div>

        </div>
      </div>
    </div>

    <div
      v-if="showPreview && product?.imageUrl"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
      @click.self="closePreview"
    >
      <div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-transparent">
        <button
          class="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-900 hover:bg-white font-bold"
          @click="closePreview"
          aria-label="Đóng"
        >
          ✕
        </button>
        <img :src="product.imageUrl" alt="" class="max-h-[85vh] w-full object-contain rounded-2xl shadow-2xl" />
      </div>
    </div>
  </div>
</template>