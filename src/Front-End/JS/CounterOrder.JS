import { ref, computed, onMounted, onUnmounted, reactive, onActivated } from 'vue'
import api from '../../api/axios.js'
import { useAuthStore } from '../Authorization/Auth.js'
import { useBrewingCart } from './BrewingCart.JS'

// Chuyển URL ảnh thành URL đầy đủ
function getImageUrl(url) {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

export const MAX_CASH = 500_000_000
export const MAX_TABLES_PER_ORDER = 3

// Format mã hóa đơn: HD_01, HD_02,...
function formatInvoiceId(raw) {
    if (!raw && raw !== 0) return ''
    const num = parseInt(raw)
    if (isNaN(num)) return String(raw)
    return `HD_${String(num).padStart(2, '0')}`
}

export function useCounterOrder() {
    const authStore = useAuthStore()

    // ── State chung ──
    const appStep = ref('order')
    const orderMode = ref('')
    const dineMode = ref(null)

    // ── Popup hủy hóa đơn ──
    const showCancelOrderPopup = ref(false)
    const cancelTargetOrder = ref(null)

    function requestCancelOrder(order) {
        cancelTargetOrder.value = order
        showCancelOrderPopup.value = true
    }

    async function confirmCancelOrder() {
        showCancelOrderPopup.value = false
        const order = cancelTargetOrder.value
        if (!order) return

        // Giải phóng bàn nếu có
        if (order.selectedTables?.length) {
            try {
                await Promise.all(
                    order.selectedTables.map(t =>
                        api.put(`/tables/release/${t}`).catch(err => console.error(`Lỗi giải phóng bàn ${t}:`, err))
                    )
                )
            } catch (error) {
                console.error('Lỗi giải phóng bàn:', error)
            }
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }

        _clearCartForOrder(order)

        const idx = orderList.value.findIndex(o => o.id === order.id)
        if (idx !== -1) orderList.value.splice(idx, 1)

        if (!orderList.value.length) {
            _resetAllState()
        } else {
            const newIdx = idx > 0 ? idx - 1 : 0
            selectOrder(orderList.value[Math.min(newIdx, orderList.value.length - 1)])
        }
        cancelTargetOrder.value = null
    }

    function closeCancelOrderPopup() {
        showCancelOrderPopup.value = false
        cancelTargetOrder.value = null
    }

    // Reset toàn bộ state về mặc định
    function _resetAllState() {
        currentOrder.value = null
        orderedItems.value = []
        selectedTables.value = []
        dineMode.value = null
        customerName.value = ''
        customerPhone.value = ''
        customerNameInput.value = ''
        customerPhoneInput.value = ''
        nameError.value = ''
        phoneError.value = ''
        customerSaved.value = false
        isEditingInfo.value = true
        orderNote.value = ''
        paymentMethod.value = 'Tiền mặt'
        discountInput.value = ''
        appliedCode.value = ''
        discountPercent.value = 0
        discountMessage.value = ''
        pendingInvoiceId.value = ''
        appStep.value = 'order'
    }

    // Xóa toàn bộ cart item của một hóa đơn
    async function _clearCartForOrder(order) {
        if (!order?.items?.length) return
        try {
            await Promise.all(order.items.map(item => api.delete(`/carts/remove/${item.cartItemId}`).catch(() => { })))
        } catch (error) {
            console.error('Lỗi xóa giỏ hàng:', error)
        }
    }

    // ── Popup hình thức + bàn ──
    const showTablePopup = ref(false)

    function openTablePopup() {
        const order = currentOrder.value
        // Tạm bỏ khỏi danh sách occupied để cho chọn lại
        if (order?.selectedTables?.length) {
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }
        selectedTables.value = order?.selectedTables ? [...order.selectedTables] : []
        dineMode.value = order?.dineMode !== undefined ? order.dineMode : null
        showTablePopup.value = true
    }

    function closeTablePopup() {
        showTablePopup.value = false
        if (currentOrder.value) {
            currentOrder.value.selectedTables = [...selectedTables.value]
            currentOrder.value.dineMode = dineMode.value
        }
        // Thêm lại vào occupied
        if (dineMode.value === true) {
            selectedTables.value.forEach(t => {
                if (!occupiedTables.value.includes(t)) occupiedTables.value.push(t)
            })
        }
    }

    // ── Thông tin khách hàng ──
    const customerName = ref('')
    const customerPhone = ref('')
    const customerNameInput = ref('')
    const customerPhoneInput = ref('')
    const nameError = ref('')
    const phoneError = ref('')
    const customerSaved = ref(false)
    const isEditingInfo = ref(true)

    // ── Popup chọn khách hàng ──
    const showSelectCustomerPopup = ref(false)
    const customerList = ref([])

    async function openSelectCustomerPopup() {
        try {
            const res = await api.get('/users/customers')
            customerList.value = res.data || []
        } catch (error) {
            console.error('Lỗi lấy danh sách khách hàng:', error)
            customerList.value = []
        }
        showSelectCustomerPopup.value = true
    }

    function closeSelectCustomerPopup() {
        showSelectCustomerPopup.value = false
    }

    function selectExistingCustomer(cus) {
        customerNameInput.value = cus.fullName || ''
        customerPhoneInput.value = cus.phone || ''
        customerName.value = cus.fullName || ''
        customerPhone.value = cus.phone || ''
        nameError.value = ''
        phoneError.value = ''
        if (currentOrder.value) {
            currentOrder.value.customerName = customerName.value
            currentOrder.value.customerPhone = customerPhone.value
        }
        closeSelectCustomerPopup()
    }

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

    // FIX 3: Validate cả tên lẫn số điện thoại
    // Trả về true nếu lưu thành công, false nếu thất bại
    async function saveCustomerInfo() {
        let valid = true
        nameError.value = ''
        phoneError.value = ''

        // Validate tên — bắt buộc phải nhập
        if (!customerNameInput.value || !customerNameInput.value.trim()) {
            nameError.value = 'Vui lòng nhập họ và tên khách hàng!'
            valid = false
        }

        // Validate số điện thoại
        if (!customerPhoneInput.value) {
            phoneError.value = 'Vui lòng nhập số điện thoại để thêm khách hàng!'
            valid = false
        } else if (customerPhoneInput.value.length < 10) {
            phoneError.value = 'Số điện thoại phải đủ 10 số!'
            valid = false
        }

        if (!valid) return false

        customerName.value = customerNameInput.value.trim()
        customerPhone.value = customerPhoneInput.value.trim()

        const res = await api.post('/users/add-pos-customer', {
            fullName: customerName.value,
            phone: customerPhone.value,
            role: "OFFLINE"
        })

        customerSaved.value = true
        isEditingInfo.value = false
        if (currentOrder.value) {
            currentOrder.value.customerName = customerName.value
            currentOrder.value.customerPhone = customerPhone.value
        }
        return true
    }

    function editCustomerInfo() { isEditingInfo.value = true }

    // ── Bàn ──
    const TOTAL_TABLES = 20
    const selectedTables = ref([])
    const occupiedTables = ref([])

    async function selectTable(num) {
        const idx = selectedTables.value.indexOf(num)
        try {
            if (idx !== -1) {
                await api.put(`/tables/release/${num}`)
                selectedTables.value.splice(idx, 1)
            } else {
                if (selectedTables.value.length >= MAX_TABLES_PER_ORDER) {
                    alert(`Tối đa ${MAX_TABLES_PER_ORDER} bàn`)
                    return
                }
                await api.put(`/tables/reserve/${num}`)
                selectedTables.value.push(num)
            }
            if (currentOrder.value) currentOrder.value.selectedTables = [...selectedTables.value]
            await refreshTableStatus()
        } catch (error) {
            console.log('Lỗi cập nhật trạng thái bàn:', error)
        }
    }

    async function refreshTableStatus() {
        try {
            const res = await api.get('/tables')
            occupiedTables.value = res.data
                .filter(t => t.status !== 'Còn trống')
                .map(t => t.tableNumber)
        } catch (error) {
            console.error('Không thể lấy trạng thái bàn:', error)
        }
    }

    const selectedTable = computed(() =>
        selectedTables.value.length ? selectedTables.value[selectedTables.value.length - 1] : null
    )

    const availableTables = computed(() =>
        Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1)
    )

    const otherOccupiedTables = computed(() =>
        occupiedTables.value.filter(t => !selectedTables.value.includes(t))
    )

    const tablesFull = computed(() => otherOccupiedTables.value.length >= TOTAL_TABLES)

    // ── Sản phẩm ──
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
            console.log('Lỗi lấy sản phẩm:', error)
        }
    }

    async function fetchCartItems(targetOrder = null) {
        const order = targetOrder || currentOrder.value
        if (!order) return
        try {
            const userId = authStore.user?.id
            const res = await api.get(`/carts/items/${userId}`)
            const items = res.data.map(item => {
                const toppingDetails = item.toppings?.map(t => ({
                    id: t.topping?.id,
                    name: t.topping?.name,
                    price: t.topping?.price
                })) || []
                const toppingTotal = item.toppings?.reduce((sum, t) => sum + t.topping.price, 0) || 0
                const sizePrice = item.size?.price || 0
                const unitPrice = item.unitPrice || (item.drink.basePrice + sizePrice + toppingTotal)
                return {
                    id: item.drink.id,
                    cartItemId: item.id,
                    name: item.drink.name,
                    image: getImageUrl(item.drink.imageUrl),
                    unitPrice,
                    qty: item.quantity,
                    size: item.size?.name || 'S',
                    ice: item.ice + '%',
                    sugar: item.sugar + '%',
                    toppings: item.toppings,
                    toppingDetails,
                    isCustom: item.isCustom,
                    beanName: item.coffeeBean?.name,
                    baseName: item.base ?? null,
                    milkName: item.milk?.name,
                }
            })
            if (order.id === currentOrder.value?.id) orderedItems.value = items
            order.items = [...items]
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error)
        }
    }

    function searchProducts() {
        const kw = searchText.value.toLowerCase().trim()
        if (!kw) { fetchDrinks(); return }
        products.value = products.value.filter(p => p.name.toLowerCase().includes(kw))
    }

    // ── Hóa đơn ──
    const MAX_ORDERS = 20
    const orderList = ref([])
    const currentOrder = ref(null)
    const orderedItems = ref([])
    let orderCounter = 0

    function createNewOrder() {
        if (orderList.value.length >= MAX_ORDERS) { alert('Đã đạt tối đa 20 hóa đơn!'); return }
        orderCounter++
        const order = {
            id: Date.now(),
            orderNumber: orderCounter,
            items: [],
            customerName: '',
            customerPhone: '',
            selectedTables: [],
            step: 'order',
            note: '',
            dineMode: null,
            addProductMode: false,
            originalOrderId: null,
        }
        orderList.value.push(order)
        selectOrder(order)
    }

    function createAddProductOrder(orderInfo) {
        if (orderList.value.length >= MAX_ORDERS) { alert('Đã đạt tối đa 20 hóa đơn!'); return }
        orderCounter++
        const order = {
            id: Date.now(),
            orderNumber: orderCounter,
            items: [],
            customerName: orderInfo.customerName || '',
            customerPhone: orderInfo.customerPhone || '',
            selectedTables: orderInfo.tables || [],
            step: 'order',
            note: '',
            dineMode: true,
            addProductMode: true,
            originalOrderId: orderInfo.originalOrderId || null,
        }
        orderList.value.push(order)
        currentOrder.value = order
        orderedItems.value = []
        selectedTables.value = [...order.selectedTables]
        orderNote.value = order.note || ''
        dineMode.value = true
        customerNameInput.value = order.customerName || ''
        customerPhoneInput.value = order.customerPhone || ''
        appStep.value = 'order'
    }

    function selectOrder(order) {
        currentOrder.value = order
        orderedItems.value = order.items ? [...order.items] : []
        selectedTables.value = order.selectedTables ? [...order.selectedTables] : []
        orderNote.value = order.note || ''
        dineMode.value = order.dineMode !== undefined ? order.dineMode : null
        customerNameInput.value = order.customerName || ''
        customerPhoneInput.value = order.customerPhone || ''
        customerName.value = order.customerName || ''
        customerPhone.value = order.customerPhone || ''
        nameError.value = ''
        phoneError.value = ''
        appStep.value = 'order'
    }

    // ── Giỏ hàng ──
    const totalPrice = computed(() =>
        orderedItems.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    )

    function removeItem(index, cartItemId) {
        api.delete(`/carts/remove/${cartItemId}`).catch(err => console.error('Lỗi xóa item:', err))
        orderedItems.value.splice(index, 1)
        if (currentOrder.value) currentOrder.value.items = [...orderedItems.value]
    }

    // ── Mã giảm giá ──
    const discountInput = ref('')
    const discountCodeList = ref([])
    const appliedCode = ref('')
    const discountPercent = ref(0)
    const discountMessage = ref('')

    async function fetchDiscountCodes() {
        try {
            const res = await api.get('/promo-codes')
            discountCodeList.value = res.data
                .filter(v => {
                    const isOnlineOffline = (v.displayLocation ?? '').toLowerCase() === 'online + offline'
                    const notExpired = new Date(v.endDate) >= new Date()
                    const hasQty = v.quantity > 0
                    const isActive = v.status === true
                    return isOnlineOffline && notExpired && hasQty && isActive
                })
                .map(v => ({
                    code: v.code,
                    label: `${v.code} – Giảm ${v.value}%`,
                    value: parseFloat(v.value),
                    minOrderValue: parseFloat(v.minOrderValue) || 0,
                }))
        } catch (e) {
            console.error('Lỗi lấy mã khuyến mãi:', e)
        }
    }

    function applyDiscount() {
        if (!discountInput.value) {
            discountMessage.value = 'Vui lòng chọn mã khuyến mãi!'
            discountPercent.value = 0
            appliedCode.value = ''
            return
        }
        const found = discountCodeList.value.find(d => d.code === discountInput.value)
        if (!found) {
            discountMessage.value = 'Mã không hợp lệ hoặc đã hết hạn!'
            discountPercent.value = 0
            appliedCode.value = ''
            return
        }
        if (found.minOrderValue > 0 && totalPrice.value < found.minOrderValue) {
            discountMessage.value = `Đơn tối thiểu ${found.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này!`
            discountPercent.value = 0
            appliedCode.value = ''
            return
        }
        appliedCode.value = found.code
        discountPercent.value = found.value
        discountMessage.value = `Áp dụng thành công! Giảm ${found.value}%`
    }

    const finalPrice = computed(() =>
        discountPercent.value > 0
            ? Math.round(totalPrice.value * (1 - discountPercent.value / 100))
            : totalPrice.value
    )

    // ── Ghi chú ──
    const orderNote = ref('')

    function onNoteInput(e) {
        orderNote.value = e.target.value
        if (currentOrder.value) currentOrder.value.note = orderNote.value
    }

    // ── Thanh toán ──
    const showPaymentPopup = ref(false)
    const showSuccessPopup = ref(false)
    const showReviewPopup = ref(false)
    const paymentMethod = ref('Tiền mặt')
    const txId = ref('')
    const txTime = ref('')
    const pendingInvoiceId = ref('')

    const receiptData = ref({
        finalPrice: 0,
        items: [],
        customerName: '',
        customerPhone: '',
        tableNums: [],
        note: '',
        dineMode: null,
        invoiceId: '',
        discountPercent: 0,
        originalPrice: 0,
    })

    function checkout() {
        if (!orderedItems.value.length) { alert('Chưa có sản phẩm nào!'); return }
        paymentMethod.value = 'Tiền mặt'
        const o = currentOrder.value
        dineMode.value = o?.dineMode !== undefined ? o.dineMode : null
        showPaymentPopup.value = true
    }

    function _buildReceiptData(resolvedInvoiceId) {
        const order = currentOrder.value
        const itemsWithDetails = orderedItems.value.map(item => {
            const cloned = JSON.parse(JSON.stringify(item))
            if (!cloned.toppingDetails?.length) {
                cloned.toppingDetails = cloned.toppings?.map(t => ({
                    id: t.topping?.id || t.id,
                    name: t.topping?.name || t.name,
                    price: t.topping?.price || t.price || 0
                })) || []
            }
            return cloned
        })

        receiptData.value = {
            finalPrice: finalPrice.value,
            items: itemsWithDetails,
            customerName: order?.customerName?.trim() || customerName.value?.trim() || '',
            customerPhone: order?.customerPhone || customerPhone.value || '',
            tableNums: order?.selectedTables || selectedTables.value || [],
            note: orderNote.value || order?.note || '',
            dineMode: dineMode.value === true,
            invoiceId: resolvedInvoiceId || '',
            discountPercent: discountPercent.value,
            originalPrice: totalPrice.value,
        }
    }

    // Lấy mã hóa đơn tiếp theo từ API
    async function _fetchNextInvoiceId() {
        try {
            const res = await api.get('/invoices')
            const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            const latest = sorted[0]
            if (latest?.invoiceId) return `HD_${String(parseInt(latest.invoiceId) + 1).padStart(2, '0')}`
            return 'HD_01'
        } catch {
            return ''
        }
    }

    async function goToReview() {
        const resolvedInvoiceId = await _fetchNextInvoiceId()
        pendingInvoiceId.value = resolvedInvoiceId
        _buildReceiptData(resolvedInvoiceId)
        txId.value = resolvedInvoiceId
        showPaymentPopup.value = false
        showReviewPopup.value = true
    }

    function backFromReview() {
        showReviewPopup.value = false
        showPaymentPopup.value = true
    }

    async function confirmPayment() {
        try {
            const userId = authStore.user?.id
            const order = currentOrder.value

            const res = await api.post('/orders/add', null, {
                params: {
                    userId,
                    note: orderNote.value || '',
                    paymentMethod: paymentMethod.value,
                    receiverName: order?.customerName?.trim() || 'Khách vãng lai',
                    receiverPhone: order?.customerPhone || '',
                    tables: displayTableNums.value,
                    finalPrice: finalPrice.value,
                    originalPrice: totalPrice.value,
                    discountAmount: totalPrice.value - finalPrice.value,  
                    discountPercent: discountPercent.value,  
                    promoCode: appliedCode.value || '',
                },
                paramsSerializer: params => {
                    const search = new URLSearchParams()
                    Object.entries(params).forEach(([key, val]) => {
                        if (Array.isArray(val)) val.forEach(v => search.append(key, v))
                        else if (val !== null && val !== undefined) search.append(key, String(val))
                    })
                    return search.toString()
                }
            })

            showReviewPopup.value = false

            // Lấy mã hóa đơn thực tế sau khi tạo thành công
            let resolvedInvoiceId = pendingInvoiceId.value
            try {
                const invoiceRes = await api.get('/invoices')
                const sorted = [...invoiceRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                const latest = sorted[0]
                if (latest?.invoiceId) resolvedInvoiceId = formatInvoiceId(latest.invoiceId)
                else if (res.data?.invoiceId) resolvedInvoiceId = formatInvoiceId(res.data.invoiceId)
            } catch {
                if (res.data?.invoiceId) resolvedInvoiceId = formatInvoiceId(res.data.invoiceId)
            }

            txId.value = resolvedInvoiceId
            txTime.value = new Date().toLocaleString('vi-VN')
            receiptData.value = { ...receiptData.value, invoiceId: resolvedInvoiceId }
            showSuccessPopup.value = true
        } catch (error) {
            console.error('Lỗi xác nhận thanh toán:', error)
        }
    }

    function closePaymentPopup() { showPaymentPopup.value = false }

    function closeSuccessPopup() {
        showSuccessPopup.value = false
        const order = currentOrder.value

        // Giải phóng bàn nếu không phải addProductMode
        if (!order?.addProductMode && order?.selectedTables) {
            order.selectedTables.forEach(t => {
                const idx = occupiedTables.value.indexOf(t)
                if (idx !== -1) occupiedTables.value.splice(idx, 1)
            })
        }

        const idx = orderList.value.findIndex(o => o.id === order?.id)
        if (idx !== -1) orderList.value.splice(idx, 1)

        if (!orderList.value.length) {
            _resetAllState()
        } else {
            selectOrder(orderList.value[orderList.value.length - 1])
        }
    }

    // ── Popup chọn topping ──
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
            console.log('Lỗi lấy topping:', error)
        }
    }

    async function fetchSizes() {
        try {
            const res = await api.get('/sizes')
            res.data.forEach(s => { SIZE_PRICES[s.name] = s.price })
        } catch (error) {
            console.log('Lỗi lấy size:', error)
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

    function isToppingSelected(t) { return selectedToppings.value.some(x => x.id === t.id) }
    function incQty() { selectedQty.value++ }
    function decQty() { if (selectedQty.value > 1) selectedQty.value-- }

    async function confirmOrder() {
        const toppingPrice = selectedToppings.value.reduce((s, t) => s + t.price, 0)
        const sizePrice = SIZE_PRICES[selectedSize.value] || 0
        const unitPrice = selectedProduct.value.price + toppingPrice + sizePrice

        const cartItemReq = {
            userId: authStore.user?.id,
            drinkId: selectedProduct.value.id,
            quantity: selectedQty.value,
            sizeId: selectedSize.value === 'S' ? 1 : (selectedSize.value === 'M' ? 2 : 3),
            ice: parseInt(selectedIce.value),
            sugar: parseInt(selectedSugar.value),
            toppings: selectedToppings.value.map(t => t.id),
            isCustom: false
        }

        try {
            const res = await api.post('/carts/add', cartItemReq)
            const newCartItemId = res.data.items[res.data.items.length - 1].id
            const toppingDetails = selectedToppings.value.map(t => ({ id: t.id, name: t.name, price: t.price }))

            const displayItem = {
                id: selectedProduct.value.id,
                cartItemId: newCartItemId,
                name: selectedProduct.value.name,
                image: selectedProduct.value.image,
                unitPrice,
                qty: selectedQty.value,
                size: selectedSize.value,
                sizeLabel: selectedSize.value,
                ice: selectedIce.value,
                sugar: selectedSugar.value,
                toppings: selectedToppings.value,
                toppingDetails,
                basePrice: selectedProduct.value.price,
                sizePrice,
            }

            orderedItems.value.push(displayItem)
            if (currentOrder.value) currentOrder.value.items = [...orderedItems.value]
            delete popupStateCache.value[selectedProduct.value.id]
            showPopup.value = false
        } catch (error) {
            console.error('Lỗi thêm sản phẩm:', error)
        }
    }

    // ── Computed hiển thị ──
    const displayCustomerName = computed(() => {
        const o = currentOrder.value
        return o?.customerName?.trim() || ''
    })

    const displayCustomerPhone = computed(() => currentOrder.value?.customerPhone || '')

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
        return o?.dineMode !== undefined ? o.dineMode : dineMode.value
    })

    const hasActiveOrder = computed(() => currentOrder.value !== null)

    // ── Brewing Cart (đồng bộ từ màn pha chế) ──
    const brewingCart = useBrewingCart()

    function checkAndConsumePendingDrinks() {
        if (!brewingCart.hasPendingDrinks()) return
        const pendingDrinks = brewingCart.consumePendingDrinks()
        if (orderList.value.length === 0) createNewOrder()
        appStep.value = 'order'
        if (currentOrder.value) currentOrder.value.step = 'order'
        pendingDrinks.forEach(drink => orderedItems.value.push(drink))
        if (currentOrder.value) currentOrder.value.items = [...orderedItems.value]
    }

    function checkAndRestoreAddProductOrder() {
        const raw = sessionStorage.getItem('addProductOrderInfo')
        if (!raw) return
        sessionStorage.removeItem('addProductOrderInfo')
        try {
            createAddProductOrder(JSON.parse(raw))
        } catch (e) {
            console.error('Lỗi khôi phục hóa đơn thêm sản phẩm:', e)
        }
    }

    // ── Lifecycle ──
    let timer = null

    onMounted(() => {
        refreshTableStatus()
        fetchDrinks()
        fetchToppings()
        fetchSizes()
        fetchDiscountCodes()
        checkAndRestoreAddProductOrder()
        checkAndConsumePendingDrinks()
        timer = setInterval(() => {
            refreshTableStatus()
            fetchDrinks()
            fetchToppings()
            fetchSizes()
            fetchDiscountCodes()
        }, 5000)
    })

    onActivated(() => {
        checkAndRestoreAddProductOrder()
        checkAndConsumePendingDrinks()
    })

    onUnmounted(() => { if (timer) clearInterval(timer) })

    // ── Export ──
    return {
        fetchDrinks, fetchToppings,
        appStep, orderMode,
        customerName, customerPhone,
        customerNameInput, customerPhoneInput,
        nameError, phoneError,
        customerSaved, isEditingInfo,
        onNameInput, onPhoneInput, saveCustomerInfo, editCustomerInfo,

        showSelectCustomerPopup, openSelectCustomerPopup, closeSelectCustomerPopup,
        customerList, selectExistingCustomer,

        TOTAL_TABLES, selectedTable, selectedTables, occupiedTables,
        availableTables, tablesFull, selectTable, MAX_TABLES_PER_ORDER,
        otherOccupiedTables,

        searchText, products, searchProducts,
        orderList, currentOrder, createNewOrder, selectOrder, MAX_ORDERS,
        orderedItems, totalPrice, removeItem,

        discountInput, discountCodeList, appliedCode, discountPercent, discountMessage, applyDiscount,
        finalPrice,
        orderNote, onNoteInput,

        checkout, showPaymentPopup, paymentMethod,
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
        showCancelOrderPopup, cancelTargetOrder,
        requestCancelOrder, confirmCancelOrder, closeCancelOrderPopup,

        hasActiveOrder,
        pendingInvoiceId,
    }
}