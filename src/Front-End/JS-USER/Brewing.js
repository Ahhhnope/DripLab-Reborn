import { computed, reactive, ref, watch } from 'vue'
import dripLabLogo from '../IMG/dripLab_Logo_Footer.png'
/**
 * useBrewing — Composable Tùy Chỉnh Đồ Uống (Luồng theo bước)
 *
 * Các bước:
 *   0 - Chọn hạt cà phê (bean)
 *   1 - Chọn base (espresso / cold brew / pour over)
 *   2 - Chọn sữa
 *   3 - Chọn topping (tối đa 3) → khi xong: cắm ống hút
 *
 * Cốc SVG điền dần theo từng bước hoàn thành.
 */
export function useBrewing() {

  // ─── DỮ LIỆU: HẠT CÀ PHÊ ─────────────────────────────────────────
  const beanOptions = [
    { id: 'arabica',  label: 'Arabica',  sub: 'Chua nhẹ, thơm hoa quả', priceDelta: 10000, color: '#3d2010' },
    { id: 'robusta',  label: 'Robusta',  sub: 'Đậm, đắng mạnh',          priceDelta: 8000,  color: '#2a1508' },
    { id: 'liberica', label: 'Liberica', sub: 'Khói, vị gỗ độc đáo',     priceDelta: 12000, color: '#3b1e0e' },
    { id: 'blend',    label: 'Blend',    sub: 'Cân bằng hoàn hảo',       priceDelta: 9000,  color: '#2e1a0d' },
  ]

  // ─── DỮ LIỆU: BASE ────────────────────────────────────────────────
  // FIX: Espresso giờ dùng màu tối hơn hẳn so với Pour Over để dễ phân biệt
  const baseOptions = [
    { id: 'espresso',  label: 'Espresso',  sub: 'Cô đặc, mạnh mẽ',    priceDelta: 15000, color: '#0f0705' }, // ← rất tối, gần đen
    { id: 'cold_brew', label: 'Cold Brew', sub: 'Lạnh, mượt mà',       priceDelta: 18000, color: '#24160f' },
    { id: 'pour_over', label: 'Pour Over', sub: 'Thanh, tinh tế',      priceDelta: 16000, color: '#5c3220' }, // ← nâu đỏ sáng hơn
  ]

  // ─── DỮ LIỆU: SỮA ─────────────────────────────────────────────────
  const milkOptions = [
    { id: 'none',   label: 'Không sữa',     sub: 'Giữ nguyên vị',    priceDelta: 0,    color: null        },
    { id: 'whole',  label: 'Sữa tươi',      sub: 'Béo ngậy, truyền thống', priceDelta: 8000, color: '#f3e9dc' },
    { id: 'oat',    label: 'Sữa yến mạch',  sub: 'Nhẹ, hơi ngọt',   priceDelta: 9000, color: '#ead9c5'   },
    { id: 'almond', label: 'Sữa hạnh nhân', sub: 'Hương hạt nhẹ',    priceDelta: 9000, color: '#efe2d1'   },
    { id: 'soy',    label: 'Sữa đậu nành',  sub: 'Thuần chay',       priceDelta: 9000, color: '#efe7dc'   },
  ]

  // ─── DỮ LIỆU: TOPPING ─────────────────────────────────────────────
  const toppingOptions = [
    { id: 'whip',            label: 'Kem tươi',       sub: 'Đánh bông mịn',    priceDelta: 8000, color: '#fffcf0' },
    { id: 'cinnamon',        label: 'Bột quế',         sub: 'Thơm ấm áp',       priceDelta: 3000, color: '#c8834a' },
    { id: 'cocoa',           label: 'Bột cacao',       sub: 'Đắng nhẹ',         priceDelta: 4000, color: '#5c3317' },
    { id: 'caramel_drizzle', label: 'Sốt caramel',     sub: 'Ngọt, bóng',       priceDelta: 8000, color: '#b9793a' },
    { id: 'vanilla_powder',  label: 'Bột vanilla',     sub: 'Thơm Madagascar',  priceDelta: 7000, color: '#d4a84b' },
  ]

  // ─── BƯỚC HIỆN TẠI ────────────────────────────────────────────────
  const currentStep = ref(0)

  const STEPS = [
    { key: 'bean',    label: 'Chọn hạt cà phê', count: null },
    { key: 'base',    label: 'Chọn base',        count: null },
    { key: 'milk',    label: 'Chọn sữa',         count: null },
    { key: 'topping', label: 'Chọn topping',     count: '0/3' },
  ]

  // ─── TRẠNG THÁI LỰA CHỌN ──────────────────────────────────────────
  const selection = reactive({
    bean:     null,
    base:     null,
    milk:     null,
    toppings: new Set(),
  })

  // ─── COMPUTED: bước nào đã hoàn thành ─────────────────────────────
  const stepDone = computed(() => ({
    bean:    selection.bean    !== null,
    base:    selection.base    !== null,
    milk:    selection.milk    !== null,
    topping: true,
  }))

  const completeReady = ref(false)
  let _completeTimer = null

  const isComplete = computed(() =>
    completeReady.value && currentStep.value === 3 && stepDone.value.bean && stepDone.value.base && stepDone.value.milk
  )

  function armCompleteDelay() {
    if (_completeTimer) return
    completeReady.value = false
    _completeTimer = setTimeout(() => {
      completeReady.value = true
      _completeTimer = null
    }, 5_000)
  }

  function clearCompleteDelay() {
    if (_completeTimer) {
      clearTimeout(_completeTimer)
      _completeTimer = null
    }
    completeReady.value = false
  }

  watch(
    () => [currentStep.value, selection.bean, selection.base, selection.milk],
    ([step, bean, base, milk]) => {
      const readyToStart = step >= 3 && !!bean && !!base && milk !== null
      if (readyToStart) armCompleteDelay()
      else clearCompleteDelay()
    },
    { immediate: true }
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

  // ─── TOPPING (tối đa 3) ───────────────────────────────────────────
  function toggleTopping(id) {
    if (selection.toppings.has(id)) {
      selection.toppings.delete(id)
      return
    }
    if (selection.toppings.size >= 3) {
      showNotice('Topping tối đa 3 loại. Bỏ bớt để chọn thêm.')
      return
    }
    selection.toppings.add(id)
  }

  // ─── ĐIỀU HƯỚNG BƯỚC ──────────────────────────────────────────────
  function goToStep(n) {
    if (n < 0 || n > 3) return
    currentStep.value = n
  }

  function nextStep() {
    if (currentStep.value < 3) currentStep.value++
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

  // ─── ANIMATION TICK ───────────────────────────────────────────────
  const animTick = ref(0)
  const toppingAnimPlayed = ref(false)
  const toppingFxKey = ref(0)

  watch(
    () => [selection.bean, selection.base, selection.milk],
    () => { animTick.value++ },
  )

  watch(currentStep, (n) => {
    if (n >= 3 && !toppingAnimPlayed.value) {
      animTick.value++
      toppingFxKey.value++
      toppingAnimPlayed.value = true
    }
  })

  // ─── COMPUTED: đối tượng nguyên liệu đang chọn ───────────────────
  const selectedBean    = computed(() => beanOptions.find(x => x.id === selection.bean))
  const selectedBase    = computed(() => baseOptions.find(x => x.id === selection.base))
  const selectedMilk    = computed(() => milkOptions.find(x => x.id === selection.milk))

  // ─── HELPER: trộn màu ─────────────────────────────────────────────
  function mixHex(a, b, t = 0.5) {
    if (!a) return b
    if (!b) return a
    const pa = a.replace('#', '')
    const pb = b.replace('#', '')

    const ar = parseInt(pa.slice(0, 2), 16)
    const ag = parseInt(pa.slice(2, 4), 16)
    const ab = parseInt(pa.slice(4, 6), 16)

    const br = parseInt(pb.slice(0, 2), 16)
    const bg = parseInt(pb.slice(2, 4), 16)
    const bb = parseInt(pb.slice(4, 6), 16)

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
    const hasBean    = !!selection.bean
    const hasBase    = !!selection.base

    // FIX: hasMilk chỉ true khi người dùng chọn sữa thật sự (không phải 'none')
    // Trước đây: hasMilk = !!selection.milk && selection.milk !== 'none'
    // Vẫn đúng logic nhưng cần đảm bảo milk layer HEIGHT = 0 khi none
    const hasMilk    = !!selection.milk && selection.milk !== 'none'
    const hasTopping = currentStep.value >= 3

    const hasCoffee = hasBase

    const coffeeH = hasCoffee ? 50 : 0
    // FIX: milkH = 0 nếu không có sữa thật sự → lớp sữa biến mất hoàn toàn
    const milkH   = hasMilk ? 40 : 0
    const foamH   = hasTopping ? 10 : 0

    const isColdBrew = selection.base === 'cold_brew'
    const isHot      = hasBase && !isColdBrew

    const coffeeColor = mixHex(
      selectedBean.value?.color ?? '#3d2010',
      selectedBase.value?.color ?? '#2b1b14',
      0.45,
    )

    return {
      bean: {
        show:   hasCoffee,
        height: coffeeH,
        color:  coffeeColor,
      },

      base: {
        show:   false,
        height: 0,
        color:  selectedBase.value?.color ?? '#2b1b14',
      },

      // FIX: show: false khi không có sữa → lớp sữa không render trong SVG
      milk: {
        show:   hasMilk,
        height: milkH,
        color:  selectedMilk.value?.color ?? '#f3e9dc',
      },

      foam: {
        // Foam chỉ hiện khi: có sữa thật (hasMilk) HOẶC user chọn topping kem tươi (whip)
        // Không có sữa + không whip → cà phê đen, không có foam
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
        dustColor: selection.toppings.has('cocoa')
          ? '#5c3317'
          : (selection.toppings.has('cinnamon') ? '#c8834a' : '#d4a84b'),
        fxKey: toppingFxKey.value,
      },

      drizzle:  { enabled: selection.toppings.has('caramel_drizzle') },
      bubbles:  { enabled: isColdBrew && hasBase },
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
    return total
  })

  function formatVnd(v) {
    return (v || 0).toLocaleString('vi-VN') + 'đ'
  }

  const toppingCountLabel = computed(() => `${selection.toppings.size}/3`)

  // ─── RESET ────────────────────────────────────────────────────────
  function reset() {
    selection.bean     = null
    selection.base     = null
    selection.milk     = null
    selection.toppings = new Set()
    currentStep.value  = 0
    toppingAnimPlayed.value = false
    toppingFxKey.value = 0
    clearCompleteDelay()
    animTick.value++
  }

  return {
    beanOptions,
    baseOptions,
    milkOptions,
    toppingOptions,
    STEPS,
    selection,
    currentStep,
    logoUrl,
    isComplete,
    stepDone,
    toppingCountLabel,
    selectBean,
    selectBase,
    selectMilk,
    toggleTopping,
    goToStep,
    nextStep,
    prevStep,
    reset,
    cupLayers,
    animTick,
    selectedBean,
    selectedBase,
    selectedMilk,
    price,
    formatVnd,
    notice,
    showNotice,
  }
}