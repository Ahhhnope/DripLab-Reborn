// src/Front-End/QRMoMo/MoMo.js
import { ref, computed, onUnmounted } from 'vue'

function getBankImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

/* ── Ảnh thẻ ngân hàng nền ── */
export const CARD_BG_IMG = new URL('../IMG/THENGANHANG.png', import.meta.url).href

/* ── Chỉ giữ ngân hàng có ảnh thật ── */
export const BANK_LIST = [
    { code: 'VCB',  name: 'Vietcombank',  img: getBankImg('Vietcombank.jpg') },
    { code: 'VIB',  name: 'VIB Bank',     img: getBankImg('VIB.png') },
    { code: 'MBB',  name: 'MBBank',       img: getBankImg('MBBANK.jpg') },
    { code: 'CTG',  name: 'VietinBank',   img: getBankImg('VietTinBank.png') },
    { code: 'TPB',  name: 'TPBank',       img: getBankImg('TPBank.jpg') },
    { code: 'HDB',  name: 'HDBank',       img: getBankImg('HDBank.jpg') },
    { code: 'TCB',  name: 'Techcombank',  img: getBankImg('techcombank.png') },
    { code: 'SCM',  name: 'Sacombank',    img: getBankImg('SacomBank.png') },
    { code: 'OCB',  name: 'OCB',          img: getBankImg('OCB.jpg') },
    { code: 'ACB',  name: 'ACB',          img: getBankImg('ACB.png') },
    { code: 'AGR',  name: 'Agribank',     img: getBankImg('Agribank.jpg') },
    { code: 'VPB',  name: 'VPBank',       img: getBankImg('VPBank.jpg') },
    { code: 'IND',  name: 'Indovina',     img: getBankImg('Indovia.png') },
    { code: 'GPB',  name: 'GPBank',       img: getBankImg('GPBank.jpg') },
    { code: 'OCN',  name: 'OceanBank',    img: getBankImg('OceanBank.png') },
    { code: 'VCR',  name: 'VietCredit',   img: getBankImg('VietCredit.png') },
    { code: 'KLB',  name: 'KienLongBank', img: getBankImg('KienLongBank.jpg') },
]

/* ── Sinh mã đơn hàng ── */
export function genOrderId() {
    return 'MOMO' + Date.now() + Math.floor(Math.random() * 9000 + 1000)
}

/* ════════════════════════════════════════════════
   COMPOSABLE chính
════════════════════════════════════════════════ */
export function useMomoPayment(props, emit) {

    // Screens: 'method' | 'atm' | 'success' | 'timeout'
    const screen  = ref('method')
    const orderId = ref(genOrderId())

    /* ── Countdown: 1h 40m = 6000 giây ── */
    const TOTAL_SEC  = 6000
    const secsRemain = ref(TOTAL_SEC)
    let   timerRef   = null

    const hh = computed(() => String(Math.floor(secsRemain.value / 3600)).padStart(2, '0'))
    const mm = computed(() => String(Math.floor((secsRemain.value % 3600) / 60)).padStart(2, '0'))
    const ss = computed(() => String(secsRemain.value % 60).padStart(2, '0'))
    const isWarning = computed(() => secsRemain.value <= 300)

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

    function resetSession() {
        clearInterval(timerRef)
        secsRemain.value = TOTAL_SEC
        orderId.value    = genOrderId()
        screen.value     = 'method'
        resetForm()
        startTimer()
    }

    onUnmounted(() => clearInterval(timerRef))

    /* ── ATM Form state ── */
    const cardNumber = ref('')
    const cardExpiry = ref('')
    const cardHolder = ref('')
    const cardPhone  = ref('')
    const errors     = ref({ number: '', expiry: '', holder: '' })
    const submitting = ref(false)

    /* Hiển thị số thẻ đầy đủ (có khoảng cách nhóm 4) — không che */
    const cardNumDisplay = computed(() => {
        const raw = cardNumber.value
        const groups = []
        for (let i = 0; i < raw.length; i += 4) groups.push(raw.slice(i, i + 4))
        return groups.join(' ')
    })

    /* Số thẻ hiển thị trên hình thẻ — đầy đủ, không che */
    const cardVisualNum = computed(() => {
        const raw = cardNumber.value
        if (!raw) return '•••• •••• •••• ••••'
        // Nhóm 4 chữ số, hiện đầy đủ
        const groups = []
        const padded = raw.padEnd(16, '•')
        for (let i = 0; i < 16; i += 4) groups.push(padded.slice(i, i + 4))
        return groups.join(' ')
    })

    /* ── Input handlers ── */
    function onNumberInput(e) {
        let val = e.target.value.replace(/\D/g, '').slice(0, 19)
        cardNumber.value = val
        errors.value.number = ''
    }

    function onExpiryInput(e) {
        let val = e.target.value.replace(/[^0-9/]/g, '')
        if (val.length === 2 && !val.includes('/') && e.inputType !== 'deleteContentBackward') {
            val = val + '/'
        }
        if (val.length > 5) val = val.slice(0, 5)
        cardExpiry.value    = val
        e.target.value      = val
        errors.value.expiry = ''
    }

    function onHolderInput(e) {
        let val = e.target.value
            .replace(/[^a-zA-ZÀ-ỹà-ỹ\s]/g, '')
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'A').replace(/[èéẹẻẽêềếệểễ]/g, 'E')
            .replace(/[ìíịỉĩ]/g, 'I').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'O')
            .replace(/[ùúụủũưừứựửữ]/g, 'U').replace(/[ỳýỵỷỹ]/g, 'Y').replace(/[đ]/g, 'D')
            .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A').replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
            .replace(/[ÌÍỊỈĨ]/g, 'I').replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
            .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U').replace(/[ỲÝỴỶỸ]/g, 'Y').replace(/[Đ]/g, 'D')
            .toUpperCase().replace(/[^A-Z\s]/g, '')
        cardHolder.value    = val
        e.target.value      = val
        errors.value.holder = ''
    }

    function onPhoneInput(e) {
        let val = e.target.value.replace(/\D/g, '').slice(0, 10)
        cardPhone.value = val
        e.target.value  = val
    }

    /* ── Validation ── */
    function validate() {
        let ok = true
        errors.value = { number: '', expiry: '', holder: '' }
        if (!cardNumber.value || cardNumber.value.length < 12) {
            errors.value.number = 'Số thẻ phải có ít nhất 12 chữ số'
            ok = false
        }
        if (!cardExpiry.value || !/^\d{2}\/\d{2}$/.test(cardExpiry.value)) {
            errors.value.expiry = 'Định dạng MM/YY (vd: 03/07)'
            ok = false
        } else {
            const [mmPart] = cardExpiry.value.split('/')
            if (parseInt(mmPart) < 1 || parseInt(mmPart) > 12) {
                errors.value.expiry = 'Tháng phải từ 01 đến 12'
                ok = false
            }
        }
        if (!cardHolder.value.trim()) {
            errors.value.holder = 'Vui lòng nhập tên chủ thẻ'
            ok = false
        }
        return ok
    }

    function resetForm() {
        cardNumber.value = ''
        cardExpiry.value = ''
        cardHolder.value = ''
        cardPhone.value  = ''
        errors.value     = { number: '', expiry: '', holder: '' }
        submitting.value = false
    }

    /* ── Submit ── */
    async function submitPayment() {
        if (!validate()) return
        submitting.value = true
        clearInterval(timerRef)
        try {
            const res = await fetch('/api/momo/atm-pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId:    orderId.value,
                    amount:     props.amount,
                    cardNumber: cardNumber.value,
                    cardExpiry: cardExpiry.value,
                    cardHolder: cardHolder.value.trim(),
                    cardPhone:  cardPhone.value || null,
                    orderInfo:  props.orderInfo,
                }),
            })
            const data = await res.json()
            if (data.success) {
                screen.value = 'success'
                setTimeout(() => emit('paid'), 3000)
            } else {
                alert(data.message || 'Thanh toán thất bại, vui lòng thử lại!')
                submitting.value = false
                startTimer()
            }
        } catch (err) {
            console.error('MoMo ATM error:', err)
            screen.value = 'success'
            setTimeout(() => emit('paid'), 3000)
        }
    }

    /* ── Navigation ── */
    function goToAtm()      { screen.value = 'atm' }
    function backToMethod() { screen.value = 'method'; resetForm() }
    function handleClose()  { clearInterval(timerRef); emit('close') }

    startTimer()

    return {
        screen, orderId,
        hh, mm, ss, isWarning,
        cardNumber, cardExpiry, cardHolder, cardPhone,
        cardNumDisplay, cardVisualNum,
        errors, submitting,
        onNumberInput, onExpiryInput, onHolderInput, onPhoneInput,
        submitPayment, goToAtm, backToMethod, handleClose, resetSession,
        BANK_LIST,
        CARD_BG_IMG,
    }
}