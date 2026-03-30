import { ref, computed } from 'vue'

function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

const DISCOUNT_CODES = { 'KM50': 50, 'KM20': 20, 'KM10': 10 }

const MOMO_ACCOUNTS = {
    '0901234567': 'NGUYEN VAN AN',
    '0912345678': 'TRAN THI BINH',
    '0923456789': 'LE HOANG MINH',
    '0934567890': 'PHAM THI LAN',
    '0945678901': 'HOANG VAN TUAN',
    '0956789012': 'NGO THI HUONG',
    '0967890123': 'VU QUOC BAO',
    '0978901234': 'DANG THI MAI',
    '0989012345': 'BUI VAN KHANH',
    '0990123456': 'DO THI NGOC',
}

function genTxId() {
    return String(Math.floor(10000000000 + Math.random() * 89999999999))
}

export function useCounterOrder() {

    // ===== SẢN PHẨM =====
    const searchText = ref('')
    const allProducts = ref([
        { id: 0, name: 'CUSTOM', image: getImg('DripLab_Logo.png'), price: 0 },
        { id: 1, name: 'Matcha Tea', image: getImg('Matcha-latte.png'), price: 45000 },
        { id: 2, name: 'Classic Latte', image: getImg('classic-latte.png'), price: 45000 },
        { id: 3, name: 'Robusta', image: getImg('arabica.png'), price: 45000 },
        { id: 4, name: 'Oolong', image: getImg('oolong.png'), price: 45000 },
        { id: 5, name: 'Milk', image: getImg('milk.jpg'), price: 45000 },
        { id: 6, name: 'Hojicha', image: getImg('Hojicha-roasted.png'), price: 45000 },
        { id: 7, name: 'Geisha', image: getImg('geisha.png'), price: 45000 },
        { id: 8, name: 'Moka', image: getImg('moka.jpg'), price: 45000 },
    ])
    const products = ref([...allProducts.value])

    function searchProducts() {
        const kw = searchText.value.toLowerCase().trim()
        products.value = kw
            ? allProducts.value.filter(p => p.name.toLowerCase().includes(kw))
            : [...allProducts.value]
    }

    // ===== HÓA ĐƠN =====
    const showOrderScreen = ref(true)
    const orderList = ref([])
    const currentOrder = ref(null)
    const orderedItems = ref([])

    function createNewOrder() {
        const order = { id: Date.now(), items: [], discountInput: '', appliedCode: '', discountPercent: 0, discountMessage: '' }
        orderList.value.push(order)
        selectOrder(order)
    }

    function selectOrder(order) {
        currentOrder.value = order
        showOrderScreen.value = false
        orderedItems.value = order.items
        discountInput.value = order.discountInput
        appliedCode.value = order.appliedCode
        discountPercent.value = order.discountPercent
        discountMessage.value = order.discountMessage
    }

    // ===== GIỎ HÀNG =====
    const totalPrice = computed(() => orderedItems.value.reduce((s, i) => s + i.price * i.qty, 0))

    function removeItem(index) {
        orderedItems.value.splice(index, 1)
        if (currentOrder.value) currentOrder.value.items = orderedItems.value
    }

    // ===== MÃ GIẢM GIÁ =====
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
        if (currentOrder.value) Object.assign(currentOrder.value, {
            discountInput: discountInput.value,
            appliedCode: appliedCode.value,
            discountPercent: discountPercent.value,
            discountMessage: discountMessage.value,
        })
    }

    const finalPrice = computed(() =>
        discountPercent.value ? totalPrice.value * (1 - discountPercent.value / 100) : totalPrice.value
    )

    // ===== THANH TOÁN =====
    const showPaymentPopup = ref(false)
    const showSuccessPopup = ref(false)
    const paymentMethod = ref('cash')
    const customerMoney = ref('')
    const changeAmount = computed(() => Math.max(0, (parseInt(customerMoney.value) || 0) - finalPrice.value))
    const txId = ref('')
    const txTime = ref('')

    function checkout() {
        if (!orderedItems.value.length) { alert('Chưa có sản phẩm nào!'); return }
        customerMoney.value = ''
        paymentMethod.value = 'cash'
        resetMomo()
        showPaymentPopup.value = true
    }

    function confirmPayment() {
        txId.value = genTxId()
        txTime.value = new Date().toLocaleString('vi-VN')
        showPaymentPopup.value = false
        showSuccessPopup.value = true
    }

    function closePaymentPopup() { showPaymentPopup.value = false }

    function closeSuccessPopup() {
        showSuccessPopup.value = false
        const idx = orderList.value.indexOf(currentOrder.value)
        if (idx !== -1) orderList.value.splice(idx, 1)
        if (!orderList.value.length) {
            showOrderScreen.value = true
            currentOrder.value = null
            orderedItems.value = []
            discountInput.value = ''
            appliedCode.value = ''
            discountPercent.value = 0
            discountMessage.value = ''
        } else {
            selectOrder(orderList.value[orderList.value.length - 1])
        }
    }

    // ===== MOMO GIẢ =====
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

    // ===== POPUP TOPPING, SIZE & SỐ LƯỢNG =====
    const showPopup = ref(false)
    const selectedProduct = ref(null)
    const selectedToppings = ref([])
    const selectedSize = ref('M')
    const selectedQty = ref(1)

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

    function openPopup(product) {
        selectedProduct.value = product
        selectedToppings.value = []
        selectedSize.value = 'M'
        selectedQty.value = 1
        showPopup.value = true
    }

    function closePopup() { showPopup.value = false }

    function toggleTopping(t) {
        const idx = selectedToppings.value.findIndex(x => x.id === t.id)
        idx === -1 ? selectedToppings.value.push(t) : selectedToppings.value.splice(idx, 1)
    }

    function isToppingSelected(t) { return selectedToppings.value.some(x => x.id === t.id) }

    function incQty() { selectedQty.value++ }
    function decQty() { if (selectedQty.value > 1) selectedQty.value-- }

    function confirmOrder() {
        const toppingPrice = selectedToppings.value.reduce((s, t) => s + t.price, 0)
        orderedItems.value.push({
            ...selectedProduct.value,
            price: selectedProduct.value.price + toppingPrice,
            qty: selectedQty.value,
            size: selectedSize.value,
            toppings: selectedToppings.value.map(t => t.name).join(', ') || 'Không có',
        })
        if (currentOrder.value) currentOrder.value.items = orderedItems.value
        closePopup()
    }

    return {
        searchText, products, searchProducts,
        showOrderScreen, orderList, currentOrder, createNewOrder, selectOrder,
        orderedItems, totalPrice, removeItem,
        discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount, finalPrice,
        checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount, confirmPayment, closePaymentPopup,
        showSuccessPopup, closeSuccessPopup, txId, txTime,
        momoPhone, momoName, momoStep, momoError, momoLoading,
        onMomoPhoneInput, confirmMomoReceiver, backMomo,
        showPopup, selectedProduct, toppingList, selectedToppings, selectedSize, selectedQty,
        openPopup, closePopup, toggleTopping, isToppingSelected, incQty, decQty, confirmOrder,
    }
}