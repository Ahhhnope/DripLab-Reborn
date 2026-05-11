import { computed, reactive, ref, watch } from 'vue'
import dripLabLogo from '../IMG/dripLab_Logo_Footer.png'
import api from '@/api/axios'

/**
 * useBrewing — Composable Tùy Chỉnh Đồ Uống (6 bước)
 *
 * Bước:
 *   0 - Chọn hạt cà phê (bean)
 *   1 - Chọn base
 *   2 - Chọn sữa
 *   3 - Chọn topping (tối đa 3) → tự động chuyển sau 800ms
 *   4 - Chọn size
 *   5 - Mức đá, mức đường, số lượng → Hoàn thành
 */
export function useBrewing() {

  const beanOptions = ref([])
  const baseOptions = ref([])
  const milkOptions = ref([])
  const toppingOptions = ref([])
  const sizeOptions = ref([])

  const iceOptions    = ['0%', '30%', '50%', '70%', '100%']
  const sugarOptions  = ['0%', '30%', '50%', '70%', '100%']

  // ─── BƯỚC HIỆN TẠI ────────────────────────────────────────────────
  const currentStep = ref(0)

  const STEPS = [
    { key: 'bean',    label: 'Chọn hạt cà phê' },
    { key: 'base',    label: 'Chọn base'        },
    { key: 'milk',    label: 'Chọn sữa'         },
    { key: 'topping', label: 'Chọn topping'     },
    { key: 'size',    label: 'Chọn size'        },
    { key: 'confirm', label: 'Xác nhận'         },
  ]

  // ─── TRẠNG THÁI LỰA CHỌN ──────────────────────────────────────────
  const selection = reactive({
    bean:     null,
    base:     null,
    milk:     null,
    toppings: new Set(),
    size:     null,
    ice:      '100%',
    sugar:    '100%',
    quantity: 1,
  })

  // ─── COMPUTED: bước nào đã hoàn thành ─────────────────────────────
  const stepDone = computed(() => ({
    bean:    selection.bean !== null,
    base:    selection.base !== null,
    milk:    selection.milk !== null,
    topping: true,   // Topping luôn coi là "done" (có thể bỏ qua)
    size:    selection.size !== null,
    confirm: false,
  }))

  // isComplete: tất cả bước bắt buộc xong và đang ở bước confirm
  const isComplete = computed(() =>
    currentStep.value === 5 &&
    !!selection.bean &&
    !!selection.base &&
    selection.milk !== null &&
    !!selection.size
  )

  // ─── LOGO TRÊN CỐC ────────────────────────────────────────────────
  const logoUrl = ref(dripLabLogo)

  // ─── THÔNG BÁO TẠM THỜI ───────────────────────────────────────────
  const notice = ref('')
  function showNotice(msg, ms = 1800) {
    notice.value = msg
    clearTimeout(showNotice._t)
    showNotice._t = setTimeout(() => { notice.value = '' }, ms)
  }

  // ─── TOPPING (tối đa 3) — tự động chuyển bước sau 800ms ──────────
  let toppingTimer = null

  function toggleTopping(id) {
    if (selection.toppings.has(id)) {
      selection.toppings.delete(id)
    } else {
      if (selection.toppings.size >= 3) {
        showNotice('Topping tối đa 3 loại. Bỏ bớt để chọn thêm.')
        return
      }
      selection.toppings.add(id)
    }

    // Reset timer mỗi lần người dùng tương tác, tự next sau 800ms
    clearTimeout(toppingTimer)
    toppingTimer = setTimeout(() => {
      nextStep()
    }, 800)
  }

  // ─── ĐIỀU HƯỚNG BƯỚC ──────────────────────────────────────────────
  // Chỉ cho phép nhảy tới bước đã unlock (≤ currentStep)
  function goToStep(n) {
    if (n < 0 || n > 5) return
    if (n > currentStep.value) return   // không nhảy trước nếu chưa xong
    currentStep.value = n
  }

  function nextStep() {
    if (currentStep.value < 5) currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 0) currentStep.value--
  }

  function selectBean(id) {
    selection.bean = id
    setTimeout(nextStep, 320)
  }

  function selectBase(id) {
    selection.base = id
    setTimeout(nextStep, 320)
  }

  function selectMilk(id) {
    selection.milk = id
    setTimeout(nextStep, 320)
  }

  // Topping: bấm nút "Bỏ qua" thủ công (không chọn topping nào)
  function confirmTopping() {
    clearTimeout(toppingTimer)
    nextStep()
  }

  function selectSize(id) {
    selection.size = id
    setTimeout(nextStep, 320)
  }

  // Điều chỉnh số lượng
  function incQty()  { if (selection.quantity < 99) selection.quantity++ }
  function decQty()  { if (selection.quantity > 1)  selection.quantity-- }

  // ─── ANIMATION TICK ───────────────────────────────────────────────
  const animTick = ref(0)
  const toppingAnimPlayed = ref(false)
  const toppingFxKey = ref(0)

  watch(
    () => selection.bean,
    (newVal, oldVal) => { if (oldVal === null && newVal !== null) animTick.value++ }
  )

  watch(
    () => selection.base,
    (newVal, oldVal) => { if (oldVal === null && newVal !== null) animTick.value++ }
  )

  watch(
    () => selection.milk,
    (newVal, oldVal) => {
      // Chỉ animate lần đầu VÀ chỉ khi chọn có sữa (không phải 'none')
      if (oldVal === null && newVal !== null && newVal !== 'none') animTick.value++
      // Khi chọn 'none' → tăng animTick để trigger hiệu ứng đá
      if (newVal === 'none') animTick.value++
    }
  )

  watch(currentStep, (n) => {
    if (n >= 3 && !toppingAnimPlayed.value) {
      animTick.value++
      toppingFxKey.value++
      toppingAnimPlayed.value = true
    }
  })

  // ─── COMPUTED: đối tượng nguyên liệu đang chọn ───────────────────
  const selectedBean  = computed(() => beanOptions.find(x => x.id === selection.bean))
  const selectedBase  = computed(() => baseOptions.find(x => x.id === selection.base))
  const selectedMilk  = computed(() => milkOptions.find(x => x.id === selection.milk))
  const selectedSize  = computed(() => sizeOptions.find(x => x.id === selection.size))

  // ─── HELPER: trộn màu ─────────────────────────────────────────────
  function mixHex(a, b, t = 0.5) {
    if (!a) return b
    if (!b) return a
    const pa = a.replace('#', '')
    const pb = b.replace('#', '')
    const ar = parseInt(pa.slice(0, 2), 16), ag = parseInt(pa.slice(2, 4), 16), ab = parseInt(pa.slice(4, 6), 16)
    const br = parseInt(pb.slice(0, 2), 16), bg = parseInt(pb.slice(2, 4), 16), bb = parseInt(pb.slice(4, 6), 16)
    const rr = Math.round(ar + (br - ar) * t)
    const rg = Math.round(ag + (bg - ag) * t)
    const rb = Math.round(ab + (bb - ab) * t)
    return '#' + [rr, rg, rb].map(v => v.toString(16).padStart(2, '0')).join('')
  }

  function darkenHex(hex, amt = 0.18) {
    if (!hex) return hex
    const p = hex.replace('#', '')
    const r = parseInt(p.slice(0, 2), 16)
    const g = parseInt(p.slice(2, 4), 16)
    const b = parseInt(p.slice(4, 6), 16)
    const rr = Math.max(0, Math.round(r * (1 - amt)))
    const rg = Math.max(0, Math.round(g * (1 - amt)))
    const rb = Math.max(0, Math.round(b * (1 - amt)))
    return '#' + [rr, rg, rb].map(v => v.toString(16).padStart(2, '0')).join('')
  }

  // ─── COMPUTED: CUP LAYERS ─────────────────────────────────────────
  const cupLayers = computed(() => {
    const hasBean  = !!selection.bean
    const hasBase  = !!selection.base
    const hasMilk  = !!selection.milk && selection.milk !== 'none'
    const hasTopping = currentStep.value >= 3

    const hasCoffee = hasBase
    const coffeeH   = hasCoffee ? 50 : 0
    const milkH     = hasMilk   ? 40 : 0
    const foamH     = hasTopping ? 10 : 0

    const isColdBrew = selection.base === 'cold_brew'
    const isHot      = hasBase && !isColdBrew

    const coffeeColor = mixHex(
      selectedBean.value?.color ?? '#3d2010',
      selectedBase.value?.color ?? '#2b1b14',
      0.45,
    )

    return {
      bean: { show: hasCoffee, height: coffeeH, color: coffeeColor },
      base: { show: false, height: 0, color: selectedBase.value?.color ?? '#2b1b14' },
      milk: { show: hasMilk, height: milkH, color: selectedMilk.value?.color ?? '#f3e9dc' },
      foam: {
        show:   hasTopping && (hasMilk || selection.toppings.has('whip')),
        height: foamH,
        color:  '#fffcf0',
      },
      mixed: {
        enabled: isComplete.value,
        height: 100,
        color: darkenHex(mixHex(coffeeColor, selectedMilk.value?.color ?? null, hasMilk ? 0.16 : 0), 0.06),
      },
      toppingsFx: {
        whip: false,
        dustEnabled: (selection.toppings.has('cocoa') || selection.toppings.has('cinnamon') || selection.toppings.has('vanilla_powder')) && currentStep.value >= 3,
        dustColor: selection.toppings.has('cocoa') ? '#5c3317' : (selection.toppings.has('cinnamon') ? '#c8834a' : '#d4a84b'),
        fxKey: toppingFxKey.value,
      },
      drizzle:  { enabled: selection.toppings.has('caramel_drizzle') },
      bubbles:  { enabled: (isColdBrew && hasBase) || (selection.milk === 'none' && hasBase) },
      steam:    { enabled: isHot },
      straw:    { enabled: isComplete.value },
      logo:     { enabled: isComplete.value && !!logoUrl.value, url: logoUrl.value },
    }
  })

  // ─── TÍNH GIÁ ─────────────────────────────────────────────────────
  const price = computed(() => {
    let total = 0
    if (selectedBean.value)  total += selectedBean.value.priceDelta
    if (selectedBase.value)  total += selectedBase.value.priceDelta
    if (selectedMilk.value && selection.milk !== 'none') total += selectedMilk.value.priceDelta
    for (const id of selection.toppings) {
      const t = toppingOptions.find(x => x.id === id)
      if (t) total += t.priceDelta
    }
    if (selectedSize.value) total += selectedSize.value.priceDelta
    return total * selection.quantity
  })

  function formatVnd(v) {
    return (v || 0).toLocaleString('vi-VN') + 'đ'
  }

  const toppingCountLabel = computed(() => `${selection.toppings.size}/3`)

  // ─── RESET ────────────────────────────────────────────────────────
  function reset() {
    clearTimeout(toppingTimer)
    selection.bean     = null
    selection.base     = null
    selection.milk     = null
    selection.toppings = new Set()
    selection.size     = null
    selection.ice      = '100%'
    selection.sugar    = '100%'
    selection.quantity = 1
    currentStep.value  = 0
    toppingAnimPlayed.value = false
    toppingFxKey.value = 0
    animTick.value++
  }

  return {
    beanOptions, baseOptions, milkOptions, toppingOptions,
    sizeOptions, iceOptions, sugarOptions,
    STEPS, selection, currentStep, logoUrl,
    isComplete, stepDone, toppingCountLabel,
    selectBean, selectBase, selectMilk, toggleTopping, confirmTopping,
    selectSize, incQty, decQty,
    goToStep, nextStep, prevStep, reset,
    cupLayers, animTick,
    selectedBean, selectedBase, selectedMilk, selectedSize,
    price, formatVnd,
    notice, showNotice,
  }
}