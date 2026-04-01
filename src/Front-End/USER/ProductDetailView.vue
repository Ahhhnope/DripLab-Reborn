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

// --- 3. TOAST (THÔNG BÁO) ---
const toast = ref('')

function showToast(msg) {
  toast.value = msg
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => (toast.value = ''), 1800)
}

// --- 4. DATA SẢN PHẨM ĐÃ ĐỒNG BỘ VỚI MENUVIEW.JS ---
const products = [
  { id: 'matcha-latte', name: 'Matcha Latte', price: 49000, imageUrl: matchaLatte },
  { id: 'matcha-nong', name: 'Matcha Nóng', price: 49000, imageUrl: matchaNong },
  { id: 'capuchino', name: 'Capuchino', price: 35000, imageUrl: capuchino },
  { id: 'mocha', name: 'Mocha', price: 35000, imageUrl: mocha },
  { id: 'geisha', name: 'Geisha', price: 35000, imageUrl: geisha },
  { id: 'phin-den', name: 'Cà phê Phin Đen', price: 29000, imageUrl: phinden },
  { id: 'phin-nau', name: 'Cà phê Phin Nâu', price: 29000, imageUrl: phinnau },
  { id: 'bac-xiu', name: 'Bạc Xỉu Kem Xốp', price: 40000, imageUrl: bacsiu },
  { id: 'cold-brew-normal', name: 'Cold Brew Nguyên Bản', price: 50000, imageUrl: coldbrew },
  { id: 'cold-brew-mat-ong', name: 'Cold Brew Mật Ong', price: 55000, imageUrl: coldbrewmatong },
  { id: 'cold-brew-vai-hong', name: 'Cold Brew Vải Hồng', price: 55000, imageUrl: coldbrewvaihong },
  { id: 'caffee-latte', name: 'Caffee Latte', price: 60000, imageUrl: latte },
]

// Lấy sản phẩm dựa trên ID trên URL (mặc định về món đầu tiên nếu sai)
const productId = computed(() => String(route.params.id || products[0]?.id || ''))
const product = computed(() => products.find((p) => p.id === productId.value) || products[0])

// --- 5. OPTIONS (TÁCH ĐƯỜNG/ĐÁ + LOCK) ---
const sugarItems = [
  { id: 'sugar_0', label: '0% đường', priceDelta: 0 },
  { id: 'sugar_30', label: '30% đường', priceDelta: 0 },
  { id: 'sugar_50', label: '50% đường', priceDelta: 0 },
  { id: 'sugar_70', label: '70% đường', priceDelta: 0 },
  { id: 'sugar_100', label: '100% đường', priceDelta: 0 },
]

const iceItems = [
  { id: 'ice_0', label: '0% đá', priceDelta: 0 },
  { id: 'ice_30', label: '30% đá', priceDelta: 0 },
  { id: 'ice_50', label: '50% đá', priceDelta: 0 },
  { id: 'ice_70', label: '70% đá', priceDelta: 0 },
  { id: 'ice_100', label: '100% đá', priceDelta: 0 },
]

const cupGroup = {
  id: 'cup',
  title: 'CỐC',
  type: 'single',
  max: 1,
  items: [
    { id: 'cup_paper', label: 'Cốc giấy', priceDelta: 0 },
    { id: 'cup_plastic', label: 'Cốc nhựa', priceDelta: 0 },
  ],
}

const toppingGroup = {
  id: 'topping',
  title: 'TOPPING',
  type: 'multi',
  max: 3, // ✅ tối đa 3 topping
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
}

// giữ loop cho các group còn lại (Cốc + Topping)
const groups = computed(() => [cupGroup, toppingGroup])

// --- 6. SELECTIONS ---
const selections = reactive({
  cup: new Set(['cup_plastic']), // mặc định cốc nhựa
  sugar: new Set(),              // lock max 1
  ice: new Set(),                // lock max 1
  topping: new Set(),            // lock max 3
})

const qty = ref(1)

function formatVnd(v) {
  return (v || 0).toLocaleString('vi-VN') + 'đ'
}

function isChecked(gId, iId) {
  return selections[gId]?.has?.(iId) || false
}

function selectSingle(groupId, itemId) {
  selections[groupId] = new Set([itemId])
}

/**
 * LOCK RULE:
 * - sugar: max 1
 * - ice: max 1
 * - topping: max 3
 * Đã chọn đủ max => disable các item khác (nhưng vẫn cho bỏ chọn item đang chọn)
 */
function isOptionDisabled(groupId, itemId, max) {
  const set = selections[groupId]
  const checked = set?.has?.(itemId) || false
  if (checked) return false // vẫn cho click để bỏ chọn

  const count = set ? set.size : 0
  return count >= max
}

function toggleWithLock(groupId, itemId, max, msgWhenBlocked) {
  const set = selections[groupId] || (selections[groupId] = new Set())

  // bỏ chọn
  if (set.has(itemId)) {
    set.delete(itemId)
    return
  }

  // chặn chọn thêm
  if (set.size >= max) {
    showToast(msgWhenBlocked)
    return
  }

  set.add(itemId)
}

// validate bắt buộc chọn đủ 1 đường + 1 đá
function validateSugarIce() {
  if ((selections.sugar?.size || 0) !== 1 || (selections.ice?.size || 0) !== 1) {
    showToast('Vui lòng chọn đúng 1 mức đường và 1 mức đá.')
    return false
  }
  return true
}

// --- 7. TÍNH TIỀN ---
const lineTotal = computed(() => {
  let optionPrice = 0

  // sugar
  selections.sugar.forEach((id) => {
    const item = sugarItems.find((x) => x.id === id)
    if (item) optionPrice += item.priceDelta
  })

  // ice
  selections.ice.forEach((id) => {
    const item = iceItems.find((x) => x.id === id)
    if (item) optionPrice += item.priceDelta
  })

  // cup
  selections.cup.forEach((id) => {
    const item = cupGroup.items.find((x) => x.id === id)
    if (item) optionPrice += item.priceDelta
  })

  // topping
  selections.topping.forEach((id) => {
    const item = toppingGroup.items.find((x) => x.id === id)
    if (item) optionPrice += item.priceDelta
  })

  return ((product.value?.price || 0) + optionPrice) * qty.value
})

function addToCart() {
  if (!validateSugarIce()) return

  // TODO: sau này bạn thay bằng Pinia cart.addLine(...)
  showToast('Đã thêm vào giỏ hàng!')
}
</script>

<template>
  <div class="relative min-h-screen bg-white pb-20">
    <div class="mx-auto max-w-6xl px-4 py-6">
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300/50 text-slate-500 transition hover:bg-slate-300"
        @click="router.back()"
      >
        <span class="text-xl leading-none -translate-y-px">‹</span>
      </button>
    </div>

    <div class="mx-auto max-w-6xl px-4">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-12">
        <!-- LEFT IMAGE -->
        <div class="relative md:col-span-5">
          <div
            class="sticky top-10 cursor-pointer overflow-hidden rounded-2xl shadow-lg"
            @click="showPreview = true"
          >
            <img
              v-if="product"
              :src="product.imageUrl"
              class="aspect-4/5 w-full object-cover"
              alt="Product Image"
            />

            <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

            <div class="pointer-events-none absolute bottom-0 left-0 right-0 p-6">
              <h1 class="text-2xl font-bold leading-tight text-white drop-shadow-md md:text-3xl">
                {{ product?.name }}
              </h1>
              <p class="mt-2 text-lg font-bold text-[#3eb06b] drop-shadow-md">
                Giá: {{ formatVnd(product?.price || 0) }}
              </p>
            </div>
          </div>
        </div>

        <!-- RIGHT OPTIONS -->
        <div class="pb-10 md:col-span-7">
          <div class="space-y-8">

            <!-- ✅ MỨC ĐƯỜNG - MỨC ĐÁ (LOCK 1 + 1) -->
            <div class="border-b border-slate-100 pb-8">
              <div class="mb-6 flex items-center gap-2">
                <span class="text-base font-bold uppercase tracking-wide text-slate-800">MỨC ĐƯỜNG - MỨC ĐÁ</span>
                <span class="text-xs font-medium text-slate-400">• mỗi loại chọn 1</span>
              </div>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- SUGAR -->
                <div>
                  <div class="mb-3 text-sm font-bold text-slate-700">MỨC ĐƯỜNG</div>
                  <div class="space-y-2">
                    <label
                      v-for="it in sugarItems"
                      :key="it.id"
                      class="flex items-start gap-3 rounded-xl p-3"
                      :class="isOptionDisabled('sugar', it.id, 1)
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-slate-50'"
                    >
                      <input
                        type="checkbox"
                        class="mt-1 h-4.5 w-4.5 cursor-pointer accent-[#126b23]"
                        :checked="isChecked('sugar', it.id)"
                        :disabled="isOptionDisabled('sugar', it.id, 1)"
                        @change="toggleWithLock('sugar', it.id, 1, 'Mức đường: chỉ được chọn 1 mức. Bỏ chọn mức hiện tại để đổi.')"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold text-slate-800">{{ it.label }}</span>
                        <span class="mt-0.5 text-xs font-medium text-slate-400">0đ</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- ICE -->
                <div>
                  <div class="mb-3 text-sm font-bold text-slate-700">MỨC ĐÁ</div>
                  <div class="space-y-2">
                    <label
                      v-for="it in iceItems"
                      :key="it.id"
                      class="flex items-start gap-3 rounded-xl p-3"
                      :class="isOptionDisabled('ice', it.id, 1)
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-slate-50'"
                    >
                      <input
                        type="checkbox"
                        class="mt-1 h-4.5 w-4.5 cursor-pointer accent-[#126b23]"
                        :checked="isChecked('ice', it.id)"
                        :disabled="isOptionDisabled('ice', it.id, 1)"
                        @change="toggleWithLock('ice', it.id, 1, 'Mức đá: chỉ được chọn 1 mức. Bỏ chọn mức hiện tại để đổi.')"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold text-slate-800">{{ it.label }}</span>
                        <span class="mt-0.5 text-xs font-medium text-slate-400">0đ</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✅ CỐC + TOPPING -->
            <div v-for="g in groups" :key="g.id" class="border-b border-slate-100 pb-8 last:border-0">
              <div class="mb-6 flex items-center gap-2">
                <span class="text-base font-bold uppercase tracking-wide text-slate-800">{{ g.title }}</span>
                <span class="text-xs font-medium text-slate-400">• tối đa {{ g.max }}</span>
              </div>

              <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <label
                  v-for="it in g.items"
                  :key="it.id"
                  class="flex items-start gap-3 rounded-xl p-3"
                  :class="g.type === 'multi' && isOptionDisabled(g.id, it.id, g.max)
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-slate-50'"
                >
                  <input
                    :type="g.type === 'single' ? 'radio' : 'checkbox'"
                    :name="g.id"
                    class="mt-1 h-4.5 w-4.5 cursor-pointer accent-[#126b23]"
                    :checked="isChecked(g.id, it.id)"
                    :disabled="g.type === 'multi' ? isOptionDisabled(g.id, it.id, g.max) : false"
                    @change="
                      g.type === 'single'
                        ? selectSingle(g.id, it.id)
                        : toggleWithLock(g.id, it.id, g.max, 'Topping tối đa 3 loại. Bỏ bớt để chọn loại khác.')
                    "
                  />

                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-800">{{ it.label }}</span>
                    <span class="mt-0.5 text-xs font-medium text-slate-400">
                      {{ it.priceDelta > 0 ? formatVnd(it.priceDelta) : '0đ' }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- BOTTOM BAR -->
          <div class="mt-8 flex items-center justify-between border-t border-slate-100 pt-8">
            <div class="flex items-center gap-3">
              <button
                @click="qty = Math.max(1, qty - 1)"
                class="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-lg font-medium text-slate-600 transition hover:bg-slate-200"
              >
                −
              </button>
              <span class="w-6 text-center text-base font-semibold text-slate-900">{{ qty }}</span>
              <button
                @click="qty++"
                class="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-lg font-medium text-slate-600 transition hover:bg-slate-200"
              >
                +
              </button>
            </div>

            <button
              class="rounded-lg bg-[#126b23] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0f541b]"
              @click="addToCart"
            >
              Thêm vào giỏ • +{{ formatVnd(lineTotal) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PREVIEW -->
    <div
      v-if="showPreview && product?.imageUrl"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
      @click.self="closePreview"
    >
      <div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-transparent">
        <button
          class="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 font-bold text-slate-900 hover:bg-white"
          @click="closePreview"
          aria-label="Đóng"
        >
          ✕
        </button>
        <img :src="product.imageUrl" alt="" class="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl" />
      </div>
    </div>

    <!-- TOAST -->
    <div
      v-if="toast"
      class="fixed bottom-6 left-1/2 z-120 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white"
    >
      {{ toast }}
    </div>
  </div>
</template>