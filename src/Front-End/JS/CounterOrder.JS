import { ref, computed } from 'vue'

function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

const DISCOUNT_CODES = { KM50: 50, KM20: 20, KM10: 10 }

const MOMO_ACCOUNTS = {
    '0901234567': 'NGUYEN VAN AN',
    '0912345678': 'TRAN THI BINH',
    '0923456789': 'LE HOANG MINH',
    '0934567890': 'PHAM THI LAN',
    '0945678901': 'HOANG VAN TUAN',
    '0967890123': 'VU QUOC BAO',
    '0978901234': 'DANG THI MAI',
    '0989012345': 'BUI VAN KHANH',
    '0990123456': 'DO THI NGOC',
}

const MAX_CASH = 500_000_000 // 500 triệu

function genTxId() {
    return String(Math.floor(10000000000 + Math.random() * 89999999999))
}

// Bộ đếm mã khách ẩn danh (#DRIPLAB01, 02,...)
let anonCounter = 0
function genAnonCode() {
    anonCounter++
    return `#DRIPLAB${String(anonCounter).padStart(2, '0')}`
}

export function useCounterOrder() {

    /* ══════════════════════════════════════════
       BƯỚC MỞ ĐẦU
    ══════════════════════════════════════════ */
    const appStep = ref('welcome')
    const orderMode = ref('')

    function goToChoice() { appStep.value = 'choice' }

    function chooseTakeaway() {
        orderMode.value = 'takeaway'
        createNewOrder()
        appStep.value = 'order'
    }

    function chooseDine() {
        orderMode.value = 'dine'
        createNewOrder()
        appStep.value = 'info'
    }

    /* ══════════════════════════════════════════
       THÔNG TIN KHÁCH HÀNG
    ══════════════════════════════════════════ */
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
        // Force update DOM để loại bỏ ký tự không hợp lệ ngay lập tức
        e.target.value = val
        nameError.value = ''
    }

    function onPhoneInput(e) {
        // Chỉ giữ lại số, loại bỏ tất cả chữ cái và ký tự đặc biệt
        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
        customerPhoneInput.value = val
        // Force update DOM — bắt buộc để chặn ký tự lạ hiển thị trên màn hình
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

    function editCustomerInfo() {
        isEditingInfo.value = true
    }

    /* ══════════════════════════════════════════
       ĐẶT BÀN
    ══════════════════════════════════════════ */
    const TOTAL_TABLES = 10
    const selectedTable = ref(null)
    const occupiedTables = ref([])

    const availableTables = computed(() =>
        Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
    )

    const tablesFull = computed(() => occupiedTables.value.length >= TOTAL_TABLES)

    function selectTable(num) {
        if (occupiedTables.value.includes(num)) return
        selectedTable.value = num
        if (currentOrder.value) {
            currentOrder.value.tableNum = num
        }
    }

    /* ══════════════════════════════════════════
       XÁC NHẬN THÔNG TIN
    ══════════════════════════════════════════ */
    const showConfirmInfo = ref(false)
    const confirmWarning = ref('')
    const confirmWarningTable = ref('')

    function goToConfirm() {
        confirmWarning.value = ''
        confirmWarningTable.value = ''

        if (!customerName.value && !customerPhone.value) {
            confirmWarning.value = 'Thông báo: Không có Tên và Số điện thoại!\nBạn có muốn thêm không?'
        } else if (!customerName.value) {
            confirmWarning.value = 'Thông báo: Chưa có Tên khách hàng!\nBạn có muốn thêm không?'
        }

        if (!selectedTable.value) {
            if (tablesFull.value) {
                confirmWarningTable.value = '⚠ Tất cả bàn đã FULL! Không thể đặt bàn.'
            } else {
                confirmWarningTable.value = 'Chưa chọn bàn — Đơn sẽ được tạo không có bàn.'
            }
        }

        showConfirmInfo.value = true
    }

    function backToInfo() { showConfirmInfo.value = false }

    function proceedToOrder() {
        showConfirmInfo.value = false

        if (currentOrder.value) {
            if (!customerName.value && !currentOrder.value.anonCode) {
                currentOrder.value.anonCode = genAnonCode()
            }
            if (selectedTable.value && !currentOrder.value.tableNum) {
                currentOrder.value.tableNum = selectedTable.value
            }
            currentOrder.value.step = 'order'
        }

        if (selectedTable.value && !occupiedTables.value.includes(selectedTable.value)) {
            occupiedTables.value.push(selectedTable.value)
        }

        appStep.value = 'order'
    }

    function backFromConfirmToInfo() { showConfirmInfo.value = false }

    /* ══════════════════════════════════════════
       SẢN PHẨM
    ══════════════════════════════════════════ */
    const searchText = ref('')

    const allProducts = ref([
        { id: 1, name: 'Bạc xỉu kem xốp', image: getImg('bacxiukemxop.jpg'), price: 40000 },
        { id: 2, name: 'Cà phê phin đen', image: getImg('cfphin.jpg'), price: 29000 },
        { id: 3, name: 'Cà phê phin nâu', image: getImg('cfphinnau.png'), price: 29000 },
        { id: 4, name: 'Cafee latte', image: getImg('cflatte.jpg'), price: 60000 },
        { id: 5, name: 'Capuchino', image: getImg('capu.jpg'), price: 35000 },
        { id: 6, name: 'Geisha', image: getImg('geisha.jpg'), price: 35000 },
        { id: 7, name: 'Hồng trà sữa', image: getImg('tsua.png'), price: 35000 },
        
    ])

    const products = ref([...allProducts.value])

    function searchProducts() {
        const kw = searchText.value.toLowerCase().trim()
        products.value = kw
            ? allProducts.value.filter(p => p.name.toLowerCase().includes(kw))
            : [...allProducts.value]
    }

    /* ══════════════════════════════════════════
       HÓA ĐƠN
    ══════════════════════════════════════════ */
    const MAX_ORDERS = 10
    const orderList = ref([])
    const currentOrder = ref(null)
    const orderedItems = ref([])

    function createNewOrder() {
        if (orderList.value.length >= MAX_ORDERS) {
            alert('Đã đạt tối đa 10 hóa đơn!')
            return
        }
        const order = {
            id: Date.now(),
            items: [],
            discountInput: '',
            appliedCode: '',
            discountPercent: 0,
            discountMessage: '',
            customerName: customerName.value || '',
            customerPhone: customerPhone.value || '',
            tableNum: selectedTable.value || null,
            anonCode: '',
            step: 'info'
        }
        orderList.value.push(order)
        selectOrder(order)
        appStep.value = 'info'
    }

    function selectOrder(order) {
        currentOrder.value = order
        orderedItems.value = order.items
        discountInput.value = order.discountInput
        appliedCode.value = order.appliedCode
        discountPercent.value = order.discountPercent
        discountMessage.value = order.discountMessage
        appStep.value = order.step || 'info'
    }

    /* ══════════════════════════════════════════
       GIỎ HÀNG
    ══════════════════════════════════════════ */
    const totalPrice = computed(() =>
        orderedItems.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    )

    function removeItem(index) {
        orderedItems.value.splice(index, 1)
        if (currentOrder.value) currentOrder.value.items = orderedItems.value
    }

    /* ══════════════════════════════════════════
       MÃ GIẢM GIÁ
    ══════════════════════════════════════════ */
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
        if (currentOrder.value) {
            Object.assign(currentOrder.value, {
                discountInput: discountInput.value,
                appliedCode: appliedCode.value,
                discountPercent: discountPercent.value,
                discountMessage: discountMessage.value,
            })
        }
    }

    const finalPrice = computed(() =>
        discountPercent.value
            ? Math.round(totalPrice.value * (1 - discountPercent.value / 100))
            : totalPrice.value
    )

    /* ══════════════════════════════════════════
       THANH TOÁN
    ══════════════════════════════════════════ */
    const showPaymentPopup = ref(false)
    const showSuccessPopup = ref(false)
    const showReviewPopup = ref(false)
    const paymentMethod = ref('cash')
    const customerMoney = ref('')
    const cashMaxWarning = ref('')
    const txId = ref('')
    const txTime = ref('')

    const customerMoneyNum = computed(() => {
        if (!customerMoney.value) return 0
        return parseInt(String(customerMoney.value).replace(/\./g, '')) || 0
    })

    const changeAmount = computed(() =>
        Math.max(0, customerMoneyNum.value - finalPrice.value)
    )

    const receiptData = ref({
        finalPrice: 0,
        change: 0,
        items: [],
        customerName: '',
        customerPhone: '',
        tableNum: null,
        anonCode: '',
        discountPercent: 0,
        originalPrice: 0,
    })

    function checkout() {
        if (!orderedItems.value.length) {
            alert('Chưa có sản phẩm nào!')
            return
        }
        customerMoney.value = ''
        paymentMethod.value = 'cash'
        resetMomo()
        showPaymentPopup.value = true
    }

    function onCashInput(e) {
        let raw = e.target.value.replace(/\D/g, '')

        if (raw.length > 9) {
            raw = raw.slice(0, 9)
        }

        const num = parseInt(raw) || 0

        if (num > MAX_CASH) {
            raw = String(MAX_CASH)
            cashMaxWarning.value = `⚠ Tối đa 500.000.000 VND`
        } else {
            cashMaxWarning.value = ''
        }

        e.target.value = raw

        customerMoney.value = raw
    }

    function goToReview() {
        const order = currentOrder.value
        receiptData.value = {
            finalPrice: finalPrice.value,
            change: changeAmount.value,
            items: JSON.parse(JSON.stringify(orderedItems.value)),
            customerName: order?.customerName || customerName.value || '',
            customerPhone: order?.customerPhone || customerPhone.value || '',
            tableNum: order?.tableNum || selectedTable.value || null,
            anonCode: order?.anonCode || '',
            discountPercent: discountPercent.value,
            originalPrice: totalPrice.value,
        }
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
        if (paymentMethod.value === 'cash') {
            receiptData.value.change = changeAmount.value
        }
        showSuccessPopup.value = true
    }

    function closePaymentPopup() { showPaymentPopup.value = false }

    function closeSuccessPopup() {
        showSuccessPopup.value = false

        const tbl = currentOrder.value?.tableNum
        if (tbl) {
            const idx = occupiedTables.value.indexOf(tbl)
            if (idx !== -1) occupiedTables.value.splice(idx, 1)
        }

        const idx = orderList.value.indexOf(currentOrder.value)
        if (idx !== -1) orderList.value.splice(idx, 1)

        if (!orderList.value.length) {
            appStep.value = 'welcome'
            currentOrder.value = null
            orderedItems.value = []
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
            selectedTable.value = null
        } else {
            selectOrder(orderList.value[orderList.value.length - 1])
        }
    }

    /* ══════════════════════════════════════════
       MOMO
    ══════════════════════════════════════════ */
    const momoPhone = ref('')
    const momoName = ref('')
    const momoStep = ref(1)
    const momoError = ref('')
    const momoLoading = ref(false)

    function resetMomo() {
        momoPhone.value = ''
        momoName.value = ''
        momoStep.value = 1
        momoError.value = ''
        momoLoading.value = false
    }

    function onMomoPhoneInput(e) {
        const clean = e.target.value.replace(/\D/g, '').slice(0, 10)
        momoPhone.value = clean
        // Force update DOM
        e.target.value = clean
        momoError.value = ''
        momoName.value = ''
        momoLoading.value = false
        if (clean.length === 10) {
            momoLoading.value = true
            setTimeout(() => {
                momoLoading.value = false
                if (MOMO_ACCOUNTS[clean]) {
                    momoName.value = MOMO_ACCOUNTS[clean]
                    momoError.value = ''
                } else {
                    momoName.value = ''
                    momoError.value = 'Không tìm thấy tên tài khoản'
                }
            }, 900)
        }
    }

    function confirmMomoReceiver() {
        if (!momoName.value) return
        momoStep.value = 2
    }

    function backMomo() { momoStep.value = 1 }

    /* ══════════════════════════════════════════
       POPUP TOPPING
    ══════════════════════════════════════════ */
    const showPopup = ref(false)
    const selectedProduct = ref(null)
    const selectedToppings = ref([])
    const selectedSize = ref('S')
    const selectedQty = ref(1)
    const selectedIce = ref('0%')
    const selectedSugar = ref('0%')

    const popupStateCache = ref({})

    const toppingList = [
        { id: 1, name: 'Trân châu đen', price: 5000 },
        { id: 2, name: 'Thạch cà phê', price: 5000 },
        { id: 3, name: 'Kem cheese', price: 8000 },
        { id: 4, name: 'Pudding trứng', price: 8000 },
        { id: 5, name: 'Kem béo', price: 6000 },
        { id: 6, name: 'Kem cheese đặc', price: 10000 },
        { id: 7, name: 'Machiato', price: 5000 },
        { id: 8, name: 'Whipping cream', price: 8000 },
    ]

    const iceOptions = ['0%', '30%', '50%', '70%', '100%']
    const sugarOptions = ['0%', '30%', '50%', '70%', '100%']

    const SIZE_PRICES = { S: 0, M: 5000, L: 10000 }

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
        if (selectedProduct.value) {
            popupStateCache.value[selectedProduct.value.id] = {
                toppings: [...selectedToppings.value],
                size: selectedSize.value,
                qty: selectedQty.value,
                ice: selectedIce.value,
                sugar: selectedSugar.value,
            }
        }
        showPopup.value = false
    }

    function toggleTopping(t) {
        if (selectedToppings.value.length >= 3 && !isToppingSelected(t)) return
        const idx = selectedToppings.value.findIndex(x => x.id === t.id)
        idx === -1 ? selectedToppings.value.push(t) : selectedToppings.value.splice(idx, 1)
    }

    function isToppingSelected(t) {
        return selectedToppings.value.some(x => x.id === t.id)
    }

    function incQty() { selectedQty.value++ }
    function decQty() { if (selectedQty.value > 1) selectedQty.value-- }

    function confirmOrder() {
        const toppingPrice = selectedToppings.value.reduce((s, t) => s + t.price, 0)
        const sizePrice = SIZE_PRICES[selectedSize.value] || 0
        const unitPrice = selectedProduct.value.price + toppingPrice + sizePrice

        orderedItems.value.push({
            id: selectedProduct.value.id,
            name: selectedProduct.value.name,
            image: selectedProduct.value.image,
            basePrice: selectedProduct.value.price,
            toppingPrice,
            sizePrice,
            unitPrice,
            qty: selectedQty.value,
            size: selectedSize.value,
            ice: selectedIce.value,
            sugar: selectedSugar.value,
            toppings: selectedToppings.value.map(t => t.name).join(', ') || 'Không có',
            toppingDetails: selectedToppings.value.map(t => ({ name: t.name, price: t.price })),
        })

        if (currentOrder.value) currentOrder.value.items = orderedItems.value

        if (selectedProduct.value) {
            delete popupStateCache.value[selectedProduct.value.id]
        }
        showPopup.value = false
    }

    /* ══════════════════════════════════════════
       COMPUTED: hiển thị bên phải
    ══════════════════════════════════════════ */
    const displayCustomerName = computed(() => {
        const order = currentOrder.value
        if (!order) return customerName.value || ''
        if (order.customerName) return order.customerName
        if (order.anonCode) return order.anonCode
        return ''
    })

    const displayCustomerPhone = computed(() => {
        const order = currentOrder.value
        if (!order) return customerPhone.value || 'Chưa có'
        return order.customerPhone || 'Chưa có'
    })

    const displayTableNum = computed(() => {
        const order = currentOrder.value
        if (!order) return selectedTable.value || null
        return order.tableNum || null
    })

    /* ══════════════════════════════════════════
       EXPORT
    ══════════════════════════════════════════ */
    return {
        appStep, orderMode,
        goToChoice, chooseTakeaway, chooseDine,

        customerName, customerPhone,
        customerNameInput, customerPhoneInput,
        nameError, phoneError,
        customerSaved, isEditingInfo,
        onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

        TOTAL_TABLES, selectedTable, occupiedTables,
        availableTables, tablesFull, selectTable,

        showConfirmInfo, confirmWarning, confirmWarningTable,
        goToConfirm, backToInfo, proceedToOrder, backFromConfirmToInfo,

        searchText, products, searchProducts,

        orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,

        orderedItems, totalPrice, removeItem,

        discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,

        checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
        cashMaxWarning, onCashInput,
        goToReview, backFromReview,
        showReviewPopup,
        confirmPayment, closePaymentPopup,
        showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,

        momoPhone, momoName, momoStep, momoError, momoLoading,
        onMomoPhoneInput, confirmMomoReceiver, backMomo,

        showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
        selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
        openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,

        displayCustomerName, displayCustomerPhone, displayTableNum,

        MAX_CASH,
    }
}