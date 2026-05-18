import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../Authorization/Auth.js'
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

  const router = useRouter()
  const authStore = useAuthStore()

  // ─── DỮ LIỆU: HẠT CÀ PHÊ ─────────────────────────────────────────

  const BEAN_COLORS = ['#3d2010', '#2a1508', '#3b1e0e', '#2e1a0d']

  const BASE_COLORS = {
    'Pha Máy': '#0f0705',
    'Pha Phin': '#5c3220',
    'Ủ Lạnh': '#24160f',
  }

  const BASE_PRICES = {
    'Pha Máy': 15000,
    'Pha Phin': 16000,
    'Ủ Lạnh': 18000,
  }

  const MILK_COLORS = ['#f3e9dc', '#ead9c5', '#efe2d1', '#efe7dc']

  const TOPPING_COLORS = {
    'Trân châu đen': '#1a1008',
    'Thạch cà phê': '#3b2a1a',
    'Kem cheese': '#fffaed',
    'Pudding trứng': '#f5dfa0',
    'Kem béo': '#fffcf0',
    'Whipping cr...': '#fffcf0',
    'Lmao special': '#c8834a',
  }

  const beanOptions = ref([])
  const baseOptions = ref([])
  const milkOptions = ref([])
  const toppingOptions = ref([])

  async function loadOptions() {
    try {
      const [beansRes, instructionsRes, milksRes, toppingsRes] = await Promise.all([
        api.get('/ingredients/coffee-beans'),
        api.get('/instructions'),           // route riêng: /api/instructions
        api.get('/ingredients/milks'),
        api.get('/ingredients/toppings'),
      ])

      // Map coffee_beans → beanOptions
      beanOptions.value = beansRes.data.map((b, i) => ({
        id: String(b.id),
        label: b.name,
        sub: 'Premium Selection',
        priceDelta: b.price ?? 0,
        color: BEAN_COLORS[i % BEAN_COLORS.length],
      }))

      // Map instructions → baseOptions (Pha Máy / Pha Phin / Ủ Lạnh)
      // Instruction entity không có field price nên priceDelta = 0
      baseOptions.value = instructionsRes.data.map((ins) => ({
        id: String(ins.id),
        label: ins.name,
        sub: ins.instructions,
        priceDelta: BASE_PRICES[ins.name] ?? 0,
        color: BASE_COLORS[ins.name] ?? '#2b1b14',
      }))

      // Map milks → milkOptions (thêm option "Không sữa" ở đầu)
      milkOptions.value = [
        { id: 'none', label: 'Không sữa', sub: 'Giữ nguyên vị', priceDelta: 0, color: null },
        ...milksRes.data.map((m, i) => ({
          id: String(m.id),
          label: m.name,
          sub: '',
          priceDelta: m.price ?? 0,
          color: MILK_COLORS[i % MILK_COLORS.length],
        })),
      ]

      // Map toppings → toppingOptions
      toppingOptions.value = toppingsRes.data.map((t) => ({
        id: String(t.id),
        label: t.name,
        sub: '',
        priceDelta: t.price ?? 0,
        color: TOPPING_COLORS[t.name] ?? '#c6a562',
      }))

    } catch (err) {
      console.error('Lỗi load options:', err)
    }
  }

  // Gọi khi composable được khởi tạo
  loadOptions()

  // ─── DỮ LIỆU: SIZE ────────────────────────────────────────────────

  const sizeOptions = [
    { id: 'S', label: 'S', sub: 'Gốc', priceDelta: 0 },
    { id: 'M', label: 'M', sub: 'Vừa', priceDelta: 5000 },
    { id: 'L', label: 'L', sub: 'Lớn', priceDelta: 10000 },
  ]

  const iceOptions = ['0%', '30%', '50%', '70%', '100%']
  const sugarOptions = ['0%', '30%', '50%', '70%', '100%']

  // ─── BƯỚC HIỆN TẠI ────────────────────────────────────────────────
  const currentStep = ref(0)

  const STEPS = [
    { key: 'bean', label: 'Chọn hạt cà phê' },
    { key: 'base', label: 'Chọn base' },
    { key: 'milk', label: 'Chọn sữa' },
    { key: 'topping', label: 'Chọn topping' },
    { key: 'size', label: 'Chọn size' },
    { key: 'confirm', label: 'Xác nhận' },
  ]

  // ─── TRẠNG THÁI LỰA CHỌN ──────────────────────────────────────────
  const selection = reactive({
    bean: null,
    base: null,
    milk: null,
    toppings: new Set(),
    size: null,
    ice: '100%',
    sugar: '100%',
    quantity: 1,
  })

  // ─── COMPUTED: bước nào đã hoàn thành ─────────────────────────────
  const stepDone = computed(() => ({
    bean: selection.bean !== null,
    base: selection.base !== null,
    milk: selection.milk !== null,
    topping: true,   // Topping luôn coi là "done" (có thể bỏ qua)
    size: selection.size !== null,
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

    clearTimeout(toppingTimer)
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
  }

  function selectBase(id) {
    selection.base = id
  }

  function selectMilk(id) {
    selection.milk = id
  }

  // Topping: bấm nút "Bỏ qua" thủ công (không chọn topping nào)
  function confirmTopping() {
    clearTimeout(toppingTimer)
    nextStep()
  }

  function selectSize(id) {
    selection.size = id
  }

  // Điều chỉnh số lượng
  function incQty() { if (selection.quantity < 99) selection.quantity++ }
  function decQty() { if (selection.quantity > 1) selection.quantity-- }

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
  const selectedBean = computed(() => beanOptions.value.find(x => x.id === selection.bean))
  const selectedBase = computed(() => baseOptions.value.find(x => x.id === selection.base))
  const selectedMilk = computed(() => milkOptions.value.find(x => x.id === selection.milk))
  const selectedSize = computed(() => sizeOptions.find(x => x.id === selection.size))

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
    const hasBean = !!selection.bean
    const hasBase = !!selection.base
    const hasMilk = !!selection.milk && selection.milk !== 'none'
    const hasTopping = currentStep.value >= 3

    const hasCoffee = hasBase
    const coffeeH = hasCoffee ? 50 : 0
    const milkH = hasMilk ? 40 : 0
    const foamH = hasTopping ? 10 : 0

    // Dùng label để kiểm tra cold brew thay vì hardcode id
    const isColdBrew = selectedBase.value?.label === 'Ủ Lạnh'
    const isHot = hasBase && !isColdBrew

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
        show: hasTopping && (hasMilk || selection.toppings.has('whip')),
        height: foamH,
        color: '#fffcf0',
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
      drizzle: { enabled: selection.toppings.has('caramel_drizzle') },
      bubbles: { enabled: (isColdBrew && hasBase) || (selection.milk === 'none' && hasBase) },
      steam: { enabled: isHot },
      straw: { enabled: isComplete.value },
      logo: { enabled: isComplete.value && !!logoUrl.value, url: logoUrl.value },
    }
  })

  // ─── TÍNH GIÁ ─────────────────────────────────────────────────────
  const price = computed(() => {
    let total = 0
    if (selectedBean.value) total += selectedBean.value.priceDelta
    if (selectedBase.value) total += selectedBase.value.priceDelta
    if (selectedMilk.value && selection.milk !== 'none') total += selectedMilk.value.priceDelta
    for (const id of selection.toppings) {
      const t = toppingOptions.value.find(x => x.id === id)
      if (t) total += t.priceDelta
    }
    if (selectedSize.value) total += selectedSize.value.priceDelta
    return total * selection.quantity
  })

  function formatVnd(v) {
    return (v || 0).toLocaleString('vi-VN') + 'đ'
  }

  const toppingCountLabel = computed(() => `${selection.toppings.size}/3`)


  // ─── THÊM VÀO GIỎ HÀNG ───────────────────────────────────────────
  const isAdding = ref(false)
  const addError = ref('')

  async function addToCart() {
    if (!isComplete.value) return
    const userId = authStore.user?.id
    if (!userId) {
      addError.value = 'Bạn cần đăng nhập để thêm vào giỏ hàng!'
      return
    }

    isAdding.value = true
    addError.value = ''

    try {
      // Map size label → sizeId (S=1, M=2, L=3)
      const SIZE_ID_MAP = { S: 1, M: 2, L: 3 }

      // Parse ice/sugar: "70%" → 70
      const iceNum = parseInt(selection.ice)
      const sugarNum = parseInt(selection.sugar)

      // Toppings: Set of string id → array of number id
      const toppingIds = [...selection.toppings].map(id => parseInt(id))

      // milkId: null nếu chọn 'none'
      const milkId = selection.milk === 'none' ? null : parseInt(selection.milk)

      const cartItemReq = {
        userId: userId,
        drinkId: 15,                                     // custom drink — id=15 "Custom coffee" (active=0)
        sizeId: SIZE_ID_MAP[selection.size] ?? 1,
        quantity: selection.quantity,
        ice: iceNum,
        sugar: sugarNum,
        toppings: toppingIds,
        isCustom: true,
        base: selectedBase.value?.label ?? null,      // "Pha Máy" / "Pha Phin" / "Ủ Lạnh"
        beanId: parseInt(selection.bean),
        milkId: milkId,
      }

      await api.post('/carts/add', cartItemReq)
      reset()
      router.push('/cart')
    } catch (err) {
      console.error('Lỗi thêm vào giỏ:', err)
      addError.value = err.response?.data?.message || 'Không thể thêm vào giỏ hàng. Thử lại nhé!'
    } finally {
      isAdding.value = false
    }
  }

  // ─── RESET ────────────────────────────────────────────────────────
  function reset() {
    clearTimeout(toppingTimer)
    selection.bean = null
    selection.base = null
    selection.milk = null
    selection.toppings = new Set()
    selection.size = null
    selection.ice = '100%'
    selection.sugar = '100%'
    selection.quantity = 1
    currentStep.value = 0
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
    addToCart, isAdding, addError,
  }
}