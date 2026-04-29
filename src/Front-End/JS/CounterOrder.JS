import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import api from '../../api/axios.js'

function getImageUrl(url) {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

const DISCOUNT_CODES = { KM50: 50, KM20: 20, KM10: 10 }
export const MAX_CASH = 500_000_000
export const MAX_TABLES_PER_ORDER = 3

function genTxId() {
    return String(Math.floor(10000000000 + Math.random() * 89999999999))
}

let anonCounter = 0
function genAnonCode() {
    anonCounter++
    return `#DRIPLAB${String(anonCounter).padStart(2, '0')}`
}

export function useCounterOrder() {

    /* ══ BƯỚC MỞ ĐẦU ═══════════════════════════════════════════════ */
    const appStep = ref('welcome')
    const orderMode = ref('')

    const hasExistingSession = ref(false)

    function goToChoice() {
        if (orderList.value.length === 0) {
            createNewOrder()
        } else {
            if (!currentOrder.value) {
                selectOrder(orderList.value[0])
            }
        }
        appStep.value = 'info'
    }

    function chooseTakeaway() {
        orderMode.value = 'takeaway'
        createNewOrder()
        if (currentOrder.value && !currentOrder.value.anonCode) {
            currentOrder.value.anonCode = genAnonCode()
        }
        appStep.value = 'order'
    }

    function chooseDine() {
        orderMode.value = 'dine'
        createNewOrder()
        appStep.value = 'info'
    }

    /* ══ HÌNH THỨC PHỤC VỤ ══════════════════════════════════════════ */
    const dineMode = ref(null)

    /* ══ POPUP HỦY HÓA ĐƠN ══════════════════════════════════════════ */
    const showCancelOrderPopup = ref(false)
    const cancelTargetOrder = ref(null)

    function requestCancelOrder(order) {
        cancelTargetOrder.value = order
        showCancelOrderPopup.value = true
    }

    function confirmCancelOrder() {
        showCancelOrderPopup.value = false
        const order = cancelTargetOrder.value
        if (!order) return

        // Giải phóng bàn đã chiếm
        if (order.selectedTables) {
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }

        const idx = orderList.value.findIndex(o => o.id === order.id)
        if (idx !== -1) orderList.value.splice(idx, 1)

        if (!orderList.value.length) {
            // Không còn hóa đơn nào → về welcome
            appStep.value = 'welcome'
            currentOrder.value = null
            orderedItems.value = []
            _resetOrderState()
        } else {
            // FIX 1: Chuyển sang hóa đơn cuối list (giữ nguyên các hóa đơn còn lại)
            // Ưu tiên hóa đơn ở vị trí trước đó, nếu không có thì lấy hóa đơn cuối
            const newIdx = idx > 0 ? idx - 1 : 0
            selectOrder(orderList.value[Math.min(newIdx, orderList.value.length - 1)])
        }
        cancelTargetOrder.value = null
    }

    function closeCancelOrderPopup() {
        showCancelOrderPopup.value = false
        cancelTargetOrder.value = null
    }

    function _resetOrderState() {
        discountInput.value = ''
        appliedCode.value = ''
        discountPercent.value = 0
        discountMessage.value = ''
        customerName.value = ''
        customerPhone.value = ''
        customerNameInput.value = ''
        customerPhoneInput.value = ''
        customerSaved.value = false
        isEditingInfo.value = true
        selectedTables.value = []
        orderNote.value = ''
        dineMode.value = null
    }

    /* ══ POPUP CHỌN HÌNH THỨC + BÀN ════════════════════════════════ */
    const showTablePopup = ref(false)
    // FIX 2: Lưu trạng thái bàn tạm thời khi mở popup để có thể thay đổi
    const tempSelectedTables = ref([])

    function openTablePopup() {
        // FIX 2: Khi mở popup, giải phóng bàn của order hiện tại khỏi occupiedTables
        // để user có thể chọn lại / đổi bàn tự do
        const order = currentOrder.value
        if (order && order.selectedTables && order.selectedTables.length) {
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }
        // Đồng bộ selectedTables từ order hiện tại
        selectedTables.value = order?.selectedTables ? [...order.selectedTables] : []
        showTablePopup.value = true
    }

    function closeTablePopup() {
        showTablePopup.value = false
        if (currentOrder.value) {
            currentOrder.value.selectedTables = [...selectedTables.value]
            currentOrder.value.dineMode = dineMode.value
        }
        // Cập nhật occupiedTables khi chọn tại quán
        if (dineMode.value === true) {
            selectedTables.value.forEach(t => {
                if (!occupiedTables.value.includes(t)) occupiedTables.value.push(t)
            })
        }
    }

    /* ══ THÔNG TIN KHÁCH HÀNG ═══════════════════════════════════════ */
    const customerName = ref('')
    const customerPhone = ref('')
    const customerNameInput = ref('')
    const customerPhoneInput = ref('')
    const nameError = ref('')
    const phoneError = ref('')
    const customerSaved = ref(false)
    const isEditingInfo = ref(true)

    function onNameInput(e) {
        const val = e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹ\s]/g, '')
        customerNameInput.value = val
        e.target.value = val
        nameError.value = ''
    }

    function onPhoneInput(e) {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
        customerPhoneInput.value = val
        e.target.value = val
        phoneError.value = ''
    }

    function saveCustomerInfo() {
        let valid = true
        nameError.value = ''
        phoneError.value = ''
        if (customerPhoneInput.value && customerPhoneInput.value.length < 10) {
            phoneError.value = 'Số điện thoại phải đủ 10 số!'
            valid = false
        }
        if (!valid) return
        customerName.value = customerNameInput.value.trim()
        customerPhone.value = customerPhoneInput.value.trim()
        customerSaved.value = true
        isEditingInfo.value = false
        if (currentOrder.value) {
            currentOrder.value.customerName = customerName.value
            currentOrder.value.customerPhone = customerPhone.value
        }
    }

    function editCustomerInfo() { isEditingInfo.value = true }

    /* ══ ĐẶT BÀN ═══════════════════════════════════════════════════ */
    const TOTAL_TABLES = 15
    const selectedTables = ref([])
    const occupiedTables = ref([])

    const selectedTable = computed(() =>
        selectedTables.value.length ? selectedTables.value[selectedTables.value.length - 1] : null
    )

    const availableTables = computed(() =>
        Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
    )
    const tablesFull = computed(() => occupiedTables.value.length >= TOTAL_TABLES)

    function selectTable(num) {
        if (occupiedTables.value.includes(num)) return
        const idx = selectedTables.value.indexOf(num)
        if (idx !== -1) {
            // FIX 2: Cho phép bỏ chọn bàn đã chọn để chọn lại
            selectedTables.value.splice(idx, 1)
        } else {
            if (selectedTables.value.length >= MAX_TABLES_PER_ORDER) {
                alert(`Mỗi hóa đơn chỉ được chọn tối đa ${MAX_TABLES_PER_ORDER} bàn!`)
                return
            }
            selectedTables.value.push(num)
        }
        if (currentOrder.value) currentOrder.value.selectedTables = [...selectedTables.value]
    }

    /* ══ XÁC NHẬN THÔNG TIN ════════════════════════════════════════ */
    const showConfirmInfo = ref(false)
    const confirmWarning = ref('')
    const confirmWarningTable = ref('')

    function goToConfirm() {
        let valid = true
        nameError.value = ''
        phoneError.value = ''
        if (customerPhoneInput.value && customerPhoneInput.value.length < 10) {
            phoneError.value = 'Số điện thoại phải đủ 10 số!'
            valid = false
        }
        if (!valid) return

        customerName.value = customerNameInput.value.trim()
        customerPhone.value = customerPhoneInput.value.trim()

        if (currentOrder.value) {
            currentOrder.value.customerName = customerName.value
            currentOrder.value.customerPhone = customerPhone.value
        }

        confirmWarning.value = ''
        confirmWarningTable.value = ''

        if (!customerName.value && !customerPhone.value) {
            confirmWarning.value = 'Thông báo: Không có Tên và Số điện thoại!\nBạn có muốn thêm không?'
        } else if (!customerName.value) {
            confirmWarning.value = 'Thông báo: Chưa có Tên khách hàng!\nBạn có muốn thêm không?'
        }
        showConfirmInfo.value = true
    }

    function backFromConfirmToInfo() { showConfirmInfo.value = false }

    function proceedToOrder() {
        showConfirmInfo.value = false
        if (currentOrder.value) {
            if (!customerName.value && !currentOrder.value.anonCode)
                currentOrder.value.anonCode = genAnonCode()
            currentOrder.value.step = 'order'
        }
        appStep.value = 'order'
    }

    /* ══ SẢN PHẨM ══════════════════════════════════════════════════ */
    const searchText = ref('')
    const products = ref([])

    async function fetchDrinks() {
        try {
            const res = await api.get('/drinks/active')
            products.value = res.data.map(d => ({
                id: d.id,
                name: d.name,
                image: getImageUrl(d.imageUrl),
                price: d.basePrice,
                category: d.category
            }))
        } catch (error) {
            console.log('error fetching drinks: ' + error)
        }
    }

    const _allProducts = ref([])
    function searchProducts() {
        const kw = searchText.value.toLowerCase().trim()
        if (!kw) {
            fetchDrinks()
            return
        }
        products.value = products.value.filter(p => p.name.toLowerCase().includes(kw))
    }

    /* ══ HÓA ĐƠN ═══════════════════════════════════════════════════ */
    // FIX 1: Tăng MAX_ORDERS từ 10 lên 15
    const MAX_ORDERS = 15
    const orderList = ref([])
    const currentOrder = ref(null)
    const orderedItems = ref([])
    // Bộ đếm tăng dần, không bao giờ giảm → số hóa đơn giữ nguyên dù xóa
    let orderCounter = 0

    function createNewOrder() {
        if (orderList.value.length >= MAX_ORDERS) { alert('Đã đạt tối đa 15 hóa đơn!'); return }
        orderCounter++
        const order = {
            id: Date.now(), orderNumber: orderCounter, items: [],
            discountInput: '', appliedCode: '', discountPercent: 0, discountMessage: '',
            customerName: '', customerPhone: '',
            selectedTables: [], anonCode: '', step: 'info',
            note: '', dineMode: null,
        }
        orderList.value.push(order)
        selectOrder(order)
    }

    function selectOrder(order) {
        // FIX 1: Khi switch hóa đơn, đồng bộ đúng state từ order đó
        currentOrder.value = order
        orderedItems.value = order.items
        discountInput.value = order.discountInput
        appliedCode.value = order.appliedCode
        discountPercent.value = order.discountPercent
        discountMessage.value = order.discountMessage
        selectedTables.value = order.selectedTables ? [...order.selectedTables] : []
        orderNote.value = order.note || ''
        dineMode.value = order.dineMode !== undefined ? order.dineMode : null
        // FIX 1: Đồng bộ thông tin khách hàng từ order
        customerNameInput.value = order.customerName || ''
        customerPhoneInput.value = order.customerPhone || ''
        appStep.value = order.step || 'info'
    }

    /* ══ GIỎ HÀNG ══════════════════════════════════════════════════ */
    const totalPrice = computed(() =>
        orderedItems.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    )
    function removeItem(index) {
        orderedItems.value.splice(index, 1)
        if (currentOrder.value) currentOrder.value.items = orderedItems.value
    }

    /* ══ MÃ GIẢM GIÁ ═══════════════════════════════════════════════ */
    const discountInput = ref('')
    const appliedCode = ref('')
    const discountPercent = ref(0)
    const discountMessage = ref('')

    const discountCodeList = ref([
        { code: 'KM50', label: 'Giảm 50%' },
        { code: 'KM20', label: 'Giảm 20%' },
        { code: 'KM10', label: 'Giảm 10%' },
    ])

    function applyDiscount() {
        const code = discountInput.value.trim().toUpperCase()
        if (DISCOUNT_CODES[code]) {
            appliedCode.value = code
            discountPercent.value = DISCOUNT_CODES[code]
            discountMessage.value = `Áp dụng thành công! Giảm ${DISCOUNT_CODES[code]}%`
        } else {
            appliedCode.value = ''
            discountPercent.value = 0
            discountMessage.value = 'Mã không hợp lệ!'
        }
        if (currentOrder.value)
            Object.assign(currentOrder.value, {
                discountInput: discountInput.value,
                appliedCode: appliedCode.value,
                discountPercent: discountPercent.value,
                discountMessage: discountMessage.value,
            })
    }

    const finalPrice = computed(() =>
        discountPercent.value
            ? Math.round(totalPrice.value * (1 - discountPercent.value / 100))
            : totalPrice.value
    )

    /* ══ GHI CHÚ ═══════════════════════════════════════════════════ */
    const orderNote = ref('')

    function onNoteInput(e) {
        orderNote.value = e.target.value
        if (currentOrder.value) currentOrder.value.note = orderNote.value
    }

    /* ══ THANH TOÁN ════════════════════════════════════════════════ */
    const showPaymentPopup = ref(false)
    const showSuccessPopup = ref(false)
    const showReviewPopup = ref(false)
    const paymentMethod = ref('cash')
    const customerMoney = ref('')
    const cashMaxWarning = ref('')
    const txId = ref('')
    const txTime = ref('')

    const payNameInput = ref('')
    const payPhoneInput = ref('')
    const payPhoneError = ref('')

    function onPayNameInput(e) {
        const val = e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹ\s]/g, '')
        payNameInput.value = val
        e.target.value = val
        if (currentOrder.value) currentOrder.value.customerName = val.trim()
    }

    function onPayPhoneInput(e) {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
        payPhoneInput.value = val
        e.target.value = val
        payPhoneError.value = ''
        if (currentOrder.value) currentOrder.value.customerPhone = val.trim()
    }

    const customerMoneyNum = computed(() => {
        if (!customerMoney.value) return 0
        return parseInt(String(customerMoney.value).replace(/\./g, '')) || 0
    })
    const changeAmount = computed(() => Math.max(0, customerMoneyNum.value - finalPrice.value))

    const receiptData = ref({
        finalPrice: 0, change: 0, items: [],
        customerName: '', customerPhone: '', tableNums: [],
        anonCode: '', discountPercent: 0, originalPrice: 0, note: '', dineMode: null,
    })

    function checkout() {
        if (!orderedItems.value.length) { alert('Chưa có sản phẩm nào!'); return }
        customerMoney.value = ''
        cashMaxWarning.value = ''
        paymentMethod.value = 'cash'
        const o = currentOrder.value
        payNameInput.value = o?.customerName || customerName.value || ''
        payPhoneInput.value = o?.customerPhone || customerPhone.value || ''
        payPhoneError.value = ''
        dineMode.value = o?.dineMode !== undefined ? o.dineMode : null
        showPaymentPopup.value = true
    }

    function onCashInput(e) {
        let raw = e.target.value.replace(/\D/g, '')
        if (raw.length > 9) raw = raw.slice(0, 9)
        const num = parseInt(raw) || 0
        if (num > MAX_CASH) {
            raw = String(MAX_CASH)
            cashMaxWarning.value = '⚠ Tối đa 500.000.000 VND'
        } else {
            cashMaxWarning.value = ''
        }
        e.target.value = raw
        customerMoney.value = raw
    }

    function _buildReceiptData(change = changeAmount.value) {
        const order = currentOrder.value
        const resolvedName = payNameInput.value.trim() || order?.customerName || customerName.value || ''
        const resolvedPhone = payPhoneInput.value.trim() || order?.customerPhone || customerPhone.value || ''
        if (order && !resolvedName && !order.anonCode) order.anonCode = genAnonCode()
        receiptData.value = {
            finalPrice: finalPrice.value,
            change,
            items: JSON.parse(JSON.stringify(orderedItems.value)),
            customerName: resolvedName,
            customerPhone: resolvedPhone,
            tableNums: order?.selectedTables || selectedTables.value || [],
            anonCode: order?.anonCode || '',
            discountPercent: discountPercent.value,
            originalPrice: totalPrice.value,
            note: orderNote.value || order?.note || '',
            dineMode: dineMode.value,
        }
    }

    function goToReview() {
        _buildReceiptData(changeAmount.value)
        showPaymentPopup.value = false
        showReviewPopup.value = true
    }

    function backFromReview() {
        showReviewPopup.value = false
        showPaymentPopup.value = true
    }

    function confirmPayment() {
        showReviewPopup.value = false
        txId.value = genTxId()
        txTime.value = new Date().toLocaleString('vi-VN')
        if (paymentMethod.value === 'cash') receiptData.value.change = changeAmount.value
        showSuccessPopup.value = true
    }

    function closePaymentPopup() { showPaymentPopup.value = false }

    function closeSuccessPopup() {
        showSuccessPopup.value = false
        const order = currentOrder.value

        if (order?.selectedTables) {
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }

        const idx = orderList.value.findIndex(o => o.id === order?.id)
        if (idx !== -1) orderList.value.splice(idx, 1)

        if (!orderList.value.length) {
            appStep.value = 'welcome'
            currentOrder.value = null
            orderedItems.value = []
            _resetOrderState()
        } else {
            selectOrder(orderList.value[orderList.value.length - 1])
        }
    }

    /* ══ POPUP TOPPING ══════════════════════════════════════════════ */
    const showPopup = ref(false)
    const selectedProduct = ref(null)
    const selectedToppings = ref([])
    const selectedSize = ref('S')
    const selectedQty = ref(1)
    const selectedIce = ref('0%')
    const selectedSugar = ref('0%')
    const popupStateCache = ref({})

    const toppingList = ref([])
    const iceOptions = ['0%', '30%', '50%', '70%', '100%']
    const sugarOptions = ['0%', '30%', '50%', '70%', '100%']
    const SIZE_PRICES = reactive({})

    async function fetchToppings() {
        try {
            const res = await api.get('/ingredients/toppings')
            toppingList.value = res.data.map(t => ({ id: t.id, name: t.name, price: t.price }))
        } catch (error) {
            console.log('error fetching toppings: ' + error)
        }
    }

    async function fetchSizes() {
        try {
            const res = await api.get('/sizes')
            res.data.forEach(s => { SIZE_PRICES[s.name] = s.price })
        } catch (error) {
            console.log('error fetching sizes: ' + error)
        }
    }

    function openPopup(product) {
        selectedProduct.value = product
        const cache = popupStateCache.value[product.id]
        if (cache) {
            selectedToppings.value = [...cache.toppings]
            selectedSize.value = cache.size
            selectedQty.value = cache.qty
            selectedIce.value = cache.ice
            selectedSugar.value = cache.sugar
        } else {
            selectedToppings.value = []
            selectedSize.value = 'S'
            selectedQty.value = 1
            selectedIce.value = '0%'
            selectedSugar.value = '0%'
        }
        showPopup.value = true
    }

    function closePopup() {
        if (selectedProduct.value)
            popupStateCache.value[selectedProduct.value.id] = {
                toppings: [...selectedToppings.value],
                size: selectedSize.value, qty: selectedQty.value,
                ice: selectedIce.value, sugar: selectedSugar.value,
            }
        showPopup.value = false
    }

    function toggleTopping(t) {
        if (selectedToppings.value.length >= 3 && !isToppingSelected(t)) return
        const idx = selectedToppings.value.findIndex(x => x.id === t.id)
        idx === -1 ? selectedToppings.value.push(t) : selectedToppings.value.splice(idx, 1)
    }
    function isToppingSelected(t) { return selectedToppings.value.some(x => x.id === t.id) }
    function incQty() { selectedQty.value++ }
    function decQty() { if (selectedQty.value > 1) selectedQty.value-- }

    function confirmOrder() {
        const toppingPrice = selectedToppings.value.reduce((s, t) => s + t.price, 0)
        const sizePrice = SIZE_PRICES[selectedSize.value] || 0
        const unitPrice = selectedProduct.value.price + toppingPrice + sizePrice
        orderedItems.value.push({
            id: selectedProduct.value.id, name: selectedProduct.value.name,
            image: selectedProduct.value.image,
            basePrice: selectedProduct.value.price, toppingPrice, sizePrice, unitPrice,
            qty: selectedQty.value, size: selectedSize.value,
            ice: selectedIce.value, sugar: selectedSugar.value,
            toppings: selectedToppings.value.map(t => t.name).join(', ') || 'Không có',
            toppingDetails: selectedToppings.value.map(t => ({ name: t.name, price: t.price })),
        })
        if (currentOrder.value) currentOrder.value.items = orderedItems.value
        if (selectedProduct.value) delete popupStateCache.value[selectedProduct.value.id]
        showPopup.value = false
    }

    /* ══ COMPUTED HIỂN THỊ ══════════════════════════════════════════ */
    const displayCustomerName = computed(() => {
        const o = currentOrder.value
        if (!o) return customerName.value || ''
        if (o.customerName) return o.customerName
        if (o.anonCode) return o.anonCode
        return ''
    })
    const displayCustomerPhone = computed(() => {
        const o = currentOrder.value
        return o?.customerPhone || customerPhone.value || 'Không Có Thông Tin'
    })
    const displayTableNums = computed(() => {
        const o = currentOrder.value
        return o?.selectedTables?.length ? o.selectedTables : selectedTables.value
    })
    const displayTableNum = computed(() => {
        const arr = displayTableNums.value
        return arr.length ? arr[arr.length - 1] : null
    })

    const displayDineMode = computed(() => {
        const o = currentOrder.value
        const mode = o?.dineMode !== undefined ? o.dineMode : dineMode.value
        if (mode === null || mode === undefined) return null
        return mode
    })

    /* ══ LIFECYCLE ══════════════════════════════════════════════════ */
    let timer = null
    onMounted(() => {
        fetchDrinks()
        fetchToppings()
        fetchSizes()
        timer = setInterval(() => {
            fetchDrinks()
            fetchToppings()
            fetchSizes()
        }, 5000)
    })
    onUnmounted(() => { if (timer) clearInterval(timer) })

    /* ══ EXPORT ════════════════════════════════════════════════════ */
    return {
        fetchDrinks, fetchToppings,

        appStep, orderMode,
        goToChoice, chooseTakeaway, chooseDine,

        showCancelOrderPopup, cancelTargetOrder,
        requestCancelOrder, confirmCancelOrder, closeCancelOrderPopup,

        customerName, customerPhone,
        customerNameInput, customerPhoneInput,
        nameError, phoneError,
        customerSaved, isEditingInfo,
        onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

        TOTAL_TABLES, selectedTable, selectedTables, occupiedTables,
        availableTables, tablesFull, selectTable, MAX_TABLES_PER_ORDER,

        showConfirmInfo, confirmWarning, confirmWarningTable,
        goToConfirm, proceedToOrder, backFromConfirmToInfo,

        searchText, products, searchProducts,

        orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,

        orderedItems, totalPrice, removeItem,

        discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,

        orderNote, onNoteInput,

        checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
        cashMaxWarning, onCashInput,
        payNameInput, payPhoneInput, payPhoneError,
        onPayNameInput, onPayPhoneInput,
        goToReview, backFromReview,
        showReviewPopup,
        confirmPayment, closePaymentPopup,
        showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,

        showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
        selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
        openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,

        displayCustomerName, displayCustomerPhone, displayTableNum, displayTableNums,
        displayDineMode,

        MAX_CASH,

        showTablePopup, openTablePopup, closeTablePopup,
        dineMode,
    }
}