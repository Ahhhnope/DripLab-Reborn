// src/Front-End/JS/CounterOrder.JS
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import api from '../../api/axios.js'


function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

const DISCOUNT_CODES = { KM50: 50, KM20: 20, KM10: 10 }
const MAX_CASH = 500_000_000
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
    const appStep   = ref('welcome')
    const orderMode = ref('')

    function goToChoice()   { appStep.value = 'choice' }

    function chooseTakeaway() {
        orderMode.value = 'takeaway'
        createNewOrder()
        // Auto assign anonCode ngay khi chọn Mang đi
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

    /* ══ THÔNG TIN KHÁCH HÀNG ═══════════════════════════════════════ */
    const customerName      = ref('')
    const customerPhone     = ref('')
    const customerNameInput = ref('')
    const customerPhoneInput= ref('')
    const nameError         = ref('')
    const phoneError        = ref('')
    const customerSaved     = ref(false)
    const isEditingInfo     = ref(true)

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
        nameError.value  = ''
        phoneError.value = ''
        if (customerPhoneInput.value && customerPhoneInput.value.length < 10) {
            phoneError.value = 'Số điện thoại phải đủ 10 số!'
            valid = false
        }
        if (!valid) return
        customerName.value  = customerNameInput.value.trim()
        customerPhone.value = customerPhoneInput.value.trim()
        customerSaved.value = true
        isEditingInfo.value = false
        if (currentOrder.value) {
            currentOrder.value.customerName  = customerName.value
            currentOrder.value.customerPhone = customerPhone.value
        }
    }

    function editCustomerInfo() { isEditingInfo.value = true }

    /* ══ ĐẶT BÀN — tối đa 3 bàn / hóa đơn ════════════════════════ */
    const TOTAL_TABLES   = 10
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
    const showConfirmInfo      = ref(false)
    const confirmWarning       = ref('')
    const confirmWarningTable  = ref('')

    function goToConfirm() {
        confirmWarning.value = ''
        confirmWarningTable.value = ''
        if (!customerName.value && !customerPhone.value) {
            confirmWarning.value = 'Thông báo: Không có Tên và Số điện thoại!\nBạn có muốn thêm không?'
        } else if (!customerName.value) {
            confirmWarning.value = 'Thông báo: Chưa có Tên khách hàng!\nBạn có muốn thêm không?'
        }
        if (!selectedTables.value.length) {
            if (tablesFull.value) {
                confirmWarningTable.value = '⚠ Tất cả bàn đã FULL! Không thể đặt bàn.'
            } else {
                confirmWarningTable.value = 'Thông Báo: Bạn chưa chọn bàn! Bạn có muốn đặt bàn không?'
            }
        }
        showConfirmInfo.value = true
    }

    function backToInfo()            { showConfirmInfo.value = false }
    function backFromConfirmToInfo() { showConfirmInfo.value = false }

    function proceedToOrder() {
        showConfirmInfo.value = false
        if (currentOrder.value) {
            if (!customerName.value && !currentOrder.value.anonCode)
                currentOrder.value.anonCode = genAnonCode()
            if (selectedTables.value.length)
                currentOrder.value.selectedTables = [...selectedTables.value]
            currentOrder.value.step = 'order'
        }
        selectedTables.value.forEach(t => {
            if (!occupiedTables.value.includes(t)) occupiedTables.value.push(t)
        })
        appStep.value = 'order'
    }

    /* ══ SẢN PHẨM ══════════════════════════════════════════════════ */
    const searchText = ref('')

    const allProducts = ref([
        // { id: 1, name: 'Bạc xỉu kem xốp',  image: getImg('bacxiukemxop.jpg'), price: 40000 },
        // { id: 2, name: 'Cà phê phin đen',   image: getImg('cfphin.jpg'),       price: 29000 },
        // { id: 3, name: 'Cà phê phin nâu',   image: getImg('cfphinnau.png'),    price: 29000 },
        // { id: 4, name: 'Cafee latte',        image: getImg('cflatte.jpg'),      price: 60000 },
        // { id: 5, name: 'Capuchino',          image: getImg('capu.jpg'),         price: 35000 },
        // { id: 6, name: 'Geisha',             image: getImg('geisha.jpg'),       price: 35000 },
        // { id: 7, name: 'Hồng trà sữa',      image: getImg('tsua.png'),         price: 35000 },
    ])
    const products = ref([])

    async function fetchDrinks() {
        try {
            const res = await api.get('/drinks/active')
            products.value = res.data.map(d => ({
                id: d.id,
                name: d.name,
                image: d.imageUrl,
                price: d.basePrice,
                category: d.category
            }))
        } catch (error) {
            console.log("error fetching drinks: "+error)
        }
        
    }



    function searchProducts() {
        const kw = searchText.value.toLowerCase().trim()
        products.value = kw
            ? allProducts.value.filter(p => p.name.toLowerCase().includes(kw))
            : [...allProducts.value]
    }

    /* ══ HÓA ĐƠN ═══════════════════════════════════════════════════ */
    const MAX_ORDERS   = 10
    const orderList    = ref([])
    const currentOrder = ref(null)
    const orderedItems = ref([])

    function createNewOrder() {
        if (orderList.value.length >= MAX_ORDERS) { alert('Đã đạt tối đa 10 hóa đơn!'); return }
        const order = {
            id: Date.now(), items: [],
            discountInput: '', appliedCode: '', discountPercent: 0, discountMessage: '',
            customerName: customerName.value || '', customerPhone: customerPhone.value || '',
            selectedTables: [], anonCode: '', step: 'info',
        }
        orderList.value.push(order)
        selectOrder(order)
        appStep.value = 'info'
    }

    function selectOrder(order) {
        currentOrder.value    = order
        orderedItems.value    = order.items
        discountInput.value   = order.discountInput
        appliedCode.value     = order.appliedCode
        discountPercent.value = order.discountPercent
        discountMessage.value = order.discountMessage
        selectedTables.value  = order.selectedTables ? [...order.selectedTables] : []
        appStep.value         = order.step || 'info'
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
    const discountInput    = ref('')
    const appliedCode      = ref('')
    const discountPercent  = ref(0)
    const discountMessage  = ref('')

    const discountCodeList = ref([
        { code: 'KM50', label: 'Giảm 50%' },
        { code: 'KM20', label: 'Giảm 20%' },
        { code: 'KM10', label: 'Giảm 10%' },
    ])

    function applyDiscount() {
        const code = discountInput.value.trim().toUpperCase()
        if (DISCOUNT_CODES[code]) {
            appliedCode.value     = code
            discountPercent.value = DISCOUNT_CODES[code]
            discountMessage.value = `Áp dụng thành công! Giảm ${DISCOUNT_CODES[code]}%`
        } else {
            appliedCode.value     = ''
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

    /* ══ THANH TOÁN ════════════════════════════════════════════════ */
    const showPaymentPopup = ref(false)
    const showSuccessPopup = ref(false)
    const showReviewPopup  = ref(false)
    const paymentMethod    = ref('cash')
    const customerMoney    = ref('')
    const cashMaxWarning   = ref('')
    const txId   = ref('')
    const txTime = ref('')

    // payNameInput/payPhoneInput kept for internal receipt building but not shown in UI
    const payNameInput  = ref('')
    const payPhoneInput = ref('')
    const payNameError  = ref('')
    const payPhoneError = ref('')

    function onPayNameInput(e) {
        const val = e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹ\s]/g, '')
        payNameInput.value = val
        e.target.value = val
        payNameError.value = ''
    }
    function onPayPhoneInput(e) {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
        payPhoneInput.value = val
        e.target.value = val
        payPhoneError.value = ''
    }

    const customerMoneyNum = computed(() => {
        if (!customerMoney.value) return 0
        return parseInt(String(customerMoney.value).replace(/\./g, '')) || 0
    })
    const changeAmount = computed(() => Math.max(0, customerMoneyNum.value - finalPrice.value))

    const receiptData = ref({
        finalPrice: 0, change: 0, items: [],
        customerName: '', customerPhone: '', tableNums: [],
        anonCode: '', discountPercent: 0, originalPrice: 0,
    })

    function checkout() {
        if (!orderedItems.value.length) { alert('Chưa có sản phẩm nào!'); return }
        customerMoney.value = ''
        paymentMethod.value = 'cash'
        const o = currentOrder.value
        // Sync payNameInput/payPhoneInput từ order hiện tại
        payNameInput.value  = o?.customerName  || customerName.value  || ''
        payPhoneInput.value = o?.customerPhone || customerPhone.value || ''
        payNameError.value  = ''
        payPhoneError.value = ''
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
        const resolvedName  = order?.customerName  || customerName.value  || ''
        const resolvedPhone = order?.customerPhone || customerPhone.value || ''
        if (order && !resolvedName && !order.anonCode) order.anonCode = genAnonCode()
        receiptData.value = {
            finalPrice: finalPrice.value,
            change,
            items: JSON.parse(JSON.stringify(orderedItems.value)),
            customerName:    resolvedName,
            customerPhone:   resolvedPhone,
            tableNums:       order?.selectedTables || selectedTables.value || [],
            anonCode:        order?.anonCode || '',
            discountPercent: discountPercent.value,
            originalPrice:   totalPrice.value,
        }
    }

    function goToReview() {
        _buildReceiptData(changeAmount.value)
        showPaymentPopup.value = false
        showReviewPopup.value  = true
    }

    function backFromReview() {
        showReviewPopup.value  = false
        showPaymentPopup.value = true
    }

    function confirmPayment() {
        showReviewPopup.value = false
        txId.value   = genTxId()
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
        const idx = orderList.value.indexOf(order)
        if (idx !== -1) orderList.value.splice(idx, 1)
        if (!orderList.value.length) {
            appStep.value          = 'welcome'
            currentOrder.value     = null
            orderedItems.value     = []
            discountInput.value    = ''
            appliedCode.value      = ''
            discountPercent.value  = 0
            discountMessage.value  = ''
            customerName.value     = ''
            customerPhone.value    = ''
            customerNameInput.value  = ''
            customerPhoneInput.value = ''
            customerSaved.value    = false
            isEditingInfo.value    = true
            selectedTables.value   = []
        } else {
            selectOrder(orderList.value[orderList.value.length - 1])
        }
    }

    /* ══ POPUP TOPPING ══════════════════════════════════════════════ */
    const showPopup       = ref(false)
    const selectedProduct = ref(null)
    const selectedToppings= ref([])
    const selectedSize    = ref('S')
    const selectedQty     = ref(1)
    const selectedIce     = ref('0%')
    const selectedSugar   = ref('0%')
    const popupStateCache = ref({})

    const toppingList = ref([
        // { id: 1, name: 'Trân châu đen',   price: 5000 },
        // { id: 2, name: 'Thạch cà phê',    price: 5000 },
        // { id: 3, name: 'Kem cheese',       price: 8000 },
        // { id: 4, name: 'Pudding trứng',    price: 8000 },
        // { id: 5, name: 'Kem béo',          price: 6000 },
        // { id: 6, name: 'Kem cheese đặc',   price: 10000 },
        // { id: 7, name: 'Machiato',         price: 5000 },
        // { id: 8, name: 'Whipping cream',   price: 8000 },
    ])
    const iceOptions   = ['0%', '30%', '50%', '70%', '100%']
    const sugarOptions = ['0%', '30%', '50%', '70%', '100%']
    const SIZE_PRICES  = reactive({})

    async function fetchToppings() {
        try {
            const res = await api.get('/ingredients/toppings')
            toppingList.value = res.data.map(t => ({
                id: t.id,
                name: t.name,
                price: t.price
            }))
        } catch (error) {
            console.log("error fetching toppings: "+error)
        }
    }

    async function fetchSizes() {
        try {
            const res = await api.get('/sizes')
            res.data.forEach(s => {
                SIZE_PRICES[s.name] = s.price
            })
        } catch (error) {
            console.log("error fetching sizes: "+error)
        }
    }


    function openPopup(product) {
        selectedProduct.value = product
        const cache = popupStateCache.value[product.id]
        if (cache) {
            selectedToppings.value = [...cache.toppings]
            selectedSize.value     = cache.size
            selectedQty.value      = cache.qty
            selectedIce.value      = cache.ice
            selectedSugar.value    = cache.sugar
        } else {
            selectedToppings.value = []
            selectedSize.value     = 'S'
            selectedQty.value      = 1
            selectedIce.value      = '0%'
            selectedSugar.value    = '0%'
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
        const sizePrice    = SIZE_PRICES[selectedSize.value] || 0
        const unitPrice    = selectedProduct.value.price + toppingPrice + sizePrice
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
        if (o.anonCode)     return o.anonCode
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


    let timer = null
    onMounted(() => {
        fetchDrinks()
        fetchToppings()
        fetchSizes()

        timer = setInterval(() => {
            fetchDrinks(),
            fetchToppings(),
            fetchSizes()
        }, 5000)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    /* ══ EXPORT ════════════════════════════════════════════════════ */
    return {
        fetchDrinks, fetchToppings,

        appStep, orderMode,
        goToChoice, chooseTakeaway, chooseDine,

        customerName, customerPhone,
        customerNameInput, customerPhoneInput,
        nameError, phoneError,
        customerSaved, isEditingInfo,
        onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

        TOTAL_TABLES, selectedTable, selectedTables, occupiedTables,
        availableTables, tablesFull, selectTable,
        MAX_TABLES_PER_ORDER,

        showConfirmInfo, confirmWarning, confirmWarningTable,
        goToConfirm, backToInfo, proceedToOrder, backFromConfirmToInfo,

        searchText, products, searchProducts,

        orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,

        orderedItems, totalPrice, removeItem,

        discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,

        checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
        cashMaxWarning, onCashInput,
        payNameInput, payPhoneInput, payNameError, payPhoneError,
        onPayNameInput, onPayPhoneInput,
        goToReview, backFromReview,
        showReviewPopup,
        confirmPayment, closePaymentPopup,
        showSuccessPopup, closeSuccessPopup, txId, txTime, receiptData,

        showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
        selectedIce, selectedSugar, iceOptions, sugarOptions, SIZE_PRICES,
        openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,

        displayCustomerName, displayCustomerPhone, displayTableNum, displayTableNums,

        MAX_CASH,
    }
}