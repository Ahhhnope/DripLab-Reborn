// src/Front-End/QRMoMo/QRmomo.js
import { ref, computed, watch, onUnmounted } from 'vue'

/* ════════════════════════════════════════════════
   Sinh mã đơn hàng fallback
════════════════════════════════════════════════ */
export function genOrderId() {
    const num = Math.floor(Math.random() * 99) + 1
    return `HD_${String(num).padStart(2, '0')}`
}

/* ════════════════════════════════════════════════
   Tạo QR SVG giả (pattern giống QR thật)
════════════════════════════════════════════════ */
export function generateFakeQR(seed) {
    const size = 25
    const cells = []
    let s = seed || Date.now()

    function rand() {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        return (s >>> 0) / 0xffffffff
    }

    const finder = new Set()
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
            finder.add(`${r},${c}`)
    }
    for (let r = 0; r < 7; r++) for (let c = size - 7; c < size; c++) {
        const fc = c - (size - 7)
        if (r === 0 || r === 6 || fc === 0 || fc === 6 || (r >= 2 && r <= 4 && fc >= 2 && fc <= 4))
            finder.add(`${r},${c}`)
    }
    for (let r = size - 7; r < size; r++) for (let c = 0; c < 7; c++) {
        const fr = r - (size - 7)
        if (fr === 0 || fr === 6 || c === 0 || c === 6 || (fr >= 2 && fr <= 4 && c >= 2 && c <= 4))
            finder.add(`${r},${c}`)
    }
    for (let i = 8; i < size - 8; i++) {
        if (i % 2 === 0) { finder.add(`6,${i}`); finder.add(`${i},6`) }
    }

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const key = `${r},${c}`
            if (finder.has(key)) {
                cells.push({ r, c, dark: true, fixed: true })
            } else {
                cells.push({ r, c, dark: rand() > 0.45, fixed: false })
            }
        }
    }
    return cells
}

/* ════════════════════════════════════════════════
   COMPOSABLE chính
════════════════════════════════════════════════ */
export function useQRMomoPayment(props, emit) {

    const screen = ref('qr')

    // orderId luôn đồng bộ với invoiceId prop (HD_xx từ CounterOrder)
    const orderId = computed(() => {
        const id = props.invoiceId && props.invoiceId.trim()
        if (id) return id
        return genOrderId()
    })

    const TOTAL_SEC = 600
    const secsRemain = ref(TOTAL_SEC)
    let timerRef = null

    const mm = computed(() => String(Math.floor(secsRemain.value / 60)).padStart(2, '0'))
    const ss = computed(() => String(secsRemain.value % 60).padStart(2, '0'))
    const isWarning = computed(() => secsRemain.value <= 60)

    function startTimer() {
        clearInterval(timerRef)
        timerRef = setInterval(() => {
            if (secsRemain.value <= 1) {
                clearInterval(timerRef)
                secsRemain.value = 0
                screen.value = 'timeout'
            } else {
                secsRemain.value--
            }
        }, 1000)
    }

    const qrSeed = ref(Date.now())
    const qrCells = computed(() => generateFakeQR(qrSeed.value))

    function resetSession() {
        clearInterval(timerRef)
        secsRemain.value = TOTAL_SEC
        qrSeed.value = Date.now()
        screen.value = 'qr'
        startTimer()
    }

    watch(
        () => props.visible,
        (newVal) => {
            if (newVal === true) {
                resetSession()
            } else {
                clearInterval(timerRef)
            }
        }
    )

    onUnmounted(() => clearInterval(timerRef))

    function simulatePaid() {
        if (screen.value !== 'qr') return
        clearInterval(timerRef)
        screen.value = 'success'
        setTimeout(() => emit('paid'), 3000)
    }

    function handleClose() {
        clearInterval(timerRef)
        emit('close')
    }

    if (props.visible) {
        startTimer()
    }

    return {
        screen, orderId,
        mm, ss, isWarning,
        qrCells,
        simulatePaid,
        handleClose,
        resetSession,
    }
}