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
  // Yêu cầu: vào bước topping sẽ chờ ~10 giây rồi mới hiển thị cốc hoàn thành.
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
    }, 10_000)
  }

  function clearCompleteDelay() {
    if (_completeTimer) {
      clearTimeout(_completeTimer)
      _completeTimer = null
    }
    completeReady.value = false
  }

  // Khi vào step topping và đã chọn đủ bean/base/milk thì bắt đầu đếm 10s
  watch(
    () => [currentStep.value, selection.bean, selection.base, selection.milk],
    ([step, bean, base, milk]) => {
      const readyToStart = step >= 3 && !!bean && !!base && milk !== null
      if (readyToStart) armCompleteDelay()
      else clearCompleteDelay()
    },
    { immediate: true }
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
  // Dùng để "remount" SVG layer nhằm chạy lại animation.
  // Yêu cầu: ở bước topping, hiệu ứng chỉ chạy 1 lần dù chọn 1/2/3 topping.
  const animTick = ref(0)
  const toppingAnimPlayed = ref(false)
  const toppingFxKey = ref(0)

  // Chỉ rerun animation khi đổi bean/base/milk
  watch(
    () => [selection.bean, selection.base, selection.milk],
    () => { animTick.value++ },
  )

  // Khi lần đầu đi tới bước topping (step=3) thì chạy 1 lần
  watch(currentStep, (n) => {
    if (n >= 3 && !toppingAnimPlayed.value) {
      animTick.value++
      toppingFxKey.value++ // chạy animation topping 1 lần
      toppingAnimPlayed.value = true
    }
  })

  // ─── COMPUTED: đối tượng nguyên liệu đang chọn ───────────────────
  const selectedBean    = computed(() => beanOptions.find(x => x.id === selection.bean))
  const selectedBase    = computed(() => baseOptions.find(x => x.id === selection.base))
  const selectedMilk    = computed(() => milkOptions.find(x => x.id === selection.milk))

  // ─── HELPER: trộn màu đơn giản (hex #rrggbb) ──────────────────────
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
    // Yêu cầu UI mới:
    // - Chọn bean (hạt) thôi: cốc vẫn TRỐNG.
    // - Chọn base: mới bắt đầu có tầng cà phê (1 tầng như ảnh 1).
    // - Chọn sữa: thêm 1 tầng sữa.
    // - Hoàn thành (có ống hút): hoà các tầng thành 1 khối.

    const hasBean    = !!selection.bean
    const hasBase    = !!selection.base
    const hasMilk    = !!selection.milk && selection.milk !== 'none'
    const hasTopping = currentStep.value >= 3

    // Coffee chỉ xuất hiện sau khi đã chọn base
    const hasCoffee = hasBase

    // Theo yêu cầu mới:
    // - Chọn base xong: cốc ~50%
    // - Chọn sữa: lên ~90%
    // - Sang bước topping: 100%
    const coffeeH = hasCoffee ? 50 : 0
    const milkH   = hasMilk ? 40 : 0
    const foamH   = hasTopping ? 10 : 0

    const isColdBrew = selection.base === 'cold_brew'
    const isHot      = hasBase && !isColdBrew

    // Màu cà phê: trộn nhẹ giữa hạt và base để khác nhau theo lựa chọn
    const coffeeColor = mixHex(
      selectedBean.value?.color ?? '#3d2010',
      selectedBase.value?.color ?? '#2b1b14',
      0.45,
    )

    return {
      // TẦNG CÀ PHÊ: chỉ xuất hiện sau khi đã chọn base
      // (Dùng key `bean` để không phải sửa nhiều ở template)
      bean: {
        show:   hasCoffee,
        height: coffeeH,
        color:  coffeeColor,
      },

      // Tắt layer base để tránh bị "2 tầng cà phê" (vì yêu cầu chỉ 1 tầng cà phê)
      base: {
        show:   false,
        height: 0,
        color:  selectedBase.value?.color ?? '#2b1b14',
      },

      // Lớp sữa (phía trên cà phê)
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

      // Khi hoàn thành (có ống hút) thì cốc "hòa" thành 1 lớp, không tách tầng
      mixed: {
        enabled: isComplete.value,
        // Khi hoàn thành (xuất hiện ống hút) thì cốc hoà 1 khối và đầy 100%
        height: 100,
        // Trộn màu cà phê với sữa (nếu có) để ra màu "hoà" nhìn tự nhiên hơn
        color: mixHex(coffeeColor, selectedMilk.value?.color ?? null, hasMilk ? 0.35 : 0),
      },

      // Hiệu ứng topping (không bị loạn khi chọn nhiều)
      toppingsFx: {
        whip: false, // bỏ hiệu ứng kem tươi
        dustEnabled: (selection.toppings.has('cocoa') || selection.toppings.has('cinnamon') || selection.toppings.has('vanilla_powder')) && currentStep.value >= 3,
        dustColor: selection.toppings.has('cocoa')
          ? '#5c3317'
          : (selection.toppings.has('cinnamon') ? '#c8834a' : '#d4a84b'),
        fxKey: toppingFxKey.value,
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
    toppingAnimPlayed.value = false
    toppingFxKey.value = 0
    clearCompleteDelay()
    animTick.value++
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