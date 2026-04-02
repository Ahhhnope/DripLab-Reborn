import { computed, reactive, ref, watch } from 'vue'

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
  const baseOptions = [
    { id: 'espresso',  label: 'Espresso',  sub: 'Cô đặc, mạnh mẽ',    priceDelta: 15000, color: '#2b1b14' },
    { id: 'cold_brew', label: 'Cold Brew', sub: 'Lạnh, mượt mà',       priceDelta: 18000, color: '#24160f' },
    { id: 'pour_over', label: 'Pour Over', sub: 'Thanh, tinh tế',      priceDelta: 16000, color: '#2f1e16' },
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
  // 0=bean, 1=base, 2=milk, 3=topping
  const currentStep = ref(0)

  const STEPS = [
    { key: 'bean',    label: 'Chọn hạt cà phê', count: null },
    { key: 'base',    label: 'Chọn base',        count: null },
    { key: 'milk',    label: 'Chọn sữa',         count: null },
    { key: 'topping', label: 'Chọn topping',     count: '0/3' },
  ]

  // ─── TRẠNG THÁI LỰA CHỌN ──────────────────────────────────────────
  const selection = reactive({
    bean:     null,   // null = chưa chọn
    base:     null,
    milk:     null,
    toppings: new Set(),
  })

  // ─── COMPUTED: bước nào đã hoàn thành ─────────────────────────────
  const stepDone = computed(() => ({
    bean:    selection.bean    !== null,
    base:    selection.base    !== null,
    milk:    selection.milk    !== null,
    topping: true, // topping không bắt buộc, luôn "done" sau khi tới bước này
  }))

  // Bước cuối cùng hoàn tất (có ống hút)
  const isComplete = computed(() =>
    currentStep.value === 3 && stepDone.value.bean && stepDone.value.base && stepDone.value.milk
  )

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

  // Chọn và tự động sang bước tiếp (bean, base, milk)
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
  watch(
    () => [selection.bean, selection.base, selection.milk, [...selection.toppings].join(',')],
    () => { animTick.value++ },
  )

  // ─── COMPUTED: đối tượng nguyên liệu đang chọn ───────────────────
  const selectedBean    = computed(() => beanOptions.find(x => x.id === selection.bean))
  const selectedBase    = computed(() => baseOptions.find(x => x.id === selection.base))
  const selectedMilk    = computed(() => milkOptions.find(x => x.id === selection.milk))

  // ─── COMPUTED: CUP LAYERS (điền dần theo bước) ───────────────────
  /**
   * Cốc có 4 vùng từ đáy lên:
   *   1. Bean layer   (lớp hạt/nền cà phê)  — xuất hiện khi chọn bean
   *   2. Base layer   (espresso/cold brew)   — xuất hiện khi chọn base
   *   3. Milk layer   (sữa)                 — xuất hiện khi chọn milk ≠ none
   *   4. Foam/topping                        — xuất hiện khi tới bước topping
   *   5. Straw (ống hút)                    — khi isComplete
   */
  const cupLayers = computed(() => {
    const hasBean    = !!selection.bean
    const hasBase    = !!selection.base
    const hasMilk    = !!selection.milk && selection.milk !== 'none'
    const hasTopping = currentStep.value >= 3

    // Chiều cao từng lớp (% của tổng chiều cao vùng lỏng trong ly)
    // Tổng không vượt quá 85%
    const beanH    = hasBean ? 22 : 0
    const baseH    = hasBase ? (hasMilk ? 32 : 48) : 0
    const milkH    = hasMilk ? 22 : 0
    const foamH    = hasTopping ? 10 : 0

    const isColdBrew = selection.base === 'cold_brew'
    const isHot      = hasBase && !isColdBrew

    return {
      // Lớp nền hạt cà phê (đáy cốc, đậm)
      bean: {
        show:   hasBean,
        height: beanH,
        color:  selectedBean.value?.color ?? '#3d2010',
      },
      // Lớp base (espresso / cold brew / pour over)
      base: {
        show:   hasBase,
        height: baseH,
        color:  selectedBase.value?.color ?? '#2b1b14',
      },
      // Lớp sữa (phía trên base)
      milk: {
        show:   hasMilk,
        height: milkH,
        color:  selectedMilk.value?.color ?? '#f3e9dc',
      },
      // Foam / topping
      foam: {
        show:   hasTopping,
        height: foamH,
        color:  '#fffcf0',
      },
      // Hiệu ứng đặc biệt
      drizzle:  { enabled: selection.toppings.has('caramel_drizzle') },
      bubbles:  { enabled: isColdBrew && hasBase },
      steam:    { enabled: isHot },
      straw:    { enabled: isComplete.value },
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

  // ─── TOPPING COUNT LABEL ──────────────────────────────────────────
  const toppingCountLabel = computed(() => `${selection.toppings.size}/3`)

  // ─── RESET ────────────────────────────────────────────────────────
  function reset() {
    selection.bean     = null
    selection.base     = null
    selection.milk     = null
    selection.toppings = new Set()
    currentStep.value  = 0
  }

  // ─── EXPORT ───────────────────────────────────────────────────────
  return {
    // Data
    beanOptions,
    baseOptions,
    milkOptions,
    toppingOptions,
    STEPS,

    // State
    selection,
    currentStep,
    isComplete,
    stepDone,
    toppingCountLabel,

    // Actions
    selectBean,
    selectBase,
    selectMilk,
    toggleTopping,
    goToStep,
    nextStep,
    prevStep,
    reset,

    // Cup
    cupLayers,
    animTick,

    // Computed helpers
    selectedBean,
    selectedBase,
    selectedMilk,

    // Price
    price,
    formatVnd,

    // Notice
    notice,
    showNotice,
  }
}