import { ref, computed } from 'vue'

// Hàm lấy đường dẫn ảnh từ thư mục IMG
function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}

export function useCounterOrder() {

    // PHẦN 1: TÌM KIẾM SẢN PHẨM

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

    // Danh sách sản phẩm hiển thị (thay đổi khi tìm kiếm)
    const products = ref([...allProducts.value])

    function searchProducts() {
        const keyword = searchText.value.toLowerCase().trim()
        if (keyword === '') {
            products.value = [...allProducts.value]
        } else {
            products.value = allProducts.value.filter(p =>
                p.name.toLowerCase().includes(keyword)
            )
        }
    }

    // PHẦN 2: QUẢN LÝ HÓA ĐƠN (TABS)

    const showOrderScreen = ref(true)
    const orderList = ref([])    // Danh sách tất cả hóa đơn
    const currentOrder = ref(null)  // Hóa đơn đang được chọn

    // Tạo hóa đơn mới
    function createNewOrder() {
        const newOrder = {
            id: orderList.value.length + 1,
            items: [],
            discountInput: '',
            appliedCode: '',
            discountPercent: 0,
            discountMessage: '',
        }
        orderList.value.push(newOrder)
        selectOrder(newOrder)
    }

    // Chuyển tab → load đúng dữ liệu của hóa đơn được chọn
    function selectOrder(order) {
        currentOrder.value = order
        showOrderScreen.value = false

        // Load giỏ hàng của hóa đơn này
        orderedItems.value = order.items

        // Load mã khuyến mãi của hóa đơn này
        discountInput.value = order.discountInput
        appliedCode.value = order.appliedCode
        discountPercent.value = order.discountPercent
        discountMessage.value = order.discountMessage
    }

    // PHẦN 3: GIỎ HÀNG (MÓN ĐÃ GỌI)

    const orderedItems = ref([])

    const totalPrice = computed(() => {
        return orderedItems.value.reduce((sum, item) => sum + item.price, 0)
    })

    function removeItem(index) {
        orderedItems.value.splice(index, 1)
        if (currentOrder.value) {
            currentOrder.value.items = orderedItems.value
        }
    }

    // PHẦN 4: MÃ KHUYẾN MÃI

    const discountCodes = {
        'KM50': 50,
        'KM20': 20,
        'KM10': 10,
    }

    const discountCodeList = ref([
        { code: 'KM50', label: 'Khuyến mãi giảm 50%' },
        { code: 'KM20', label: 'Khuyến mãi giảm 20%' },
        { code: 'KM10', label: 'Khuyến mãi giảm 10%' },
    ])

    const discountInput = ref('')
    const appliedCode = ref('')
    const discountPercent = ref(0)
    const discountMessage = ref('')

    function applyDiscount() {
        const code = discountInput.value.trim().toUpperCase()

        if (discountCodes[code]) {
            appliedCode.value = code
            discountPercent.value = discountCodes[code]
            discountMessage.value = `Áp dụng thành công! Giảm ${discountCodes[code]}%`
        } else {
            appliedCode.value = ''
            discountPercent.value = 0
            discountMessage.value = 'Mã không hợp lệ!'
        }

        if (currentOrder.value) {
            currentOrder.value.discountInput = discountInput.value
            currentOrder.value.appliedCode = appliedCode.value
            currentOrder.value.discountPercent = discountPercent.value
            currentOrder.value.discountMessage = discountMessage.value
        }
    }

    const finalPrice = computed(() => {
        if (discountPercent.value === 0) return totalPrice.value
        return totalPrice.value * (1 - discountPercent.value / 100)
    })

    // PHẦN 5: THANH TOÁN

    function checkout() {
        if (orderedItems.value.length === 0) {
            alert('Chưa có sản phẩm nào!')
            return
        }

        alert(`Thanh toán thành công!\nTổng tiền: ${finalPrice.value.toLocaleString()} VND`)

        const index = orderList.value.findIndex(o => o === currentOrder.value)
        if (index !== -1) orderList.value.splice(index, 1)

        if (orderList.value.length === 0) {
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

    // PHẦN 6: POPUP CHỌN TOPPING & SIZE

    const showPopup = ref(false)
    const selectedProduct = ref(null)

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

    const selectedToppings = ref([])
    const selectedSize = ref('M')

    function openPopup(product) {
        if (product.id === 0) return
        selectedProduct.value = product
        selectedToppings.value = []
        selectedSize.value = 'M'
        showPopup.value = true
    }

    function closePopup() {
        showPopup.value = false
        selectedProduct.value = null
    }

    function toggleTopping(topping) {
        const index = selectedToppings.value.findIndex(t => t.id === topping.id)
        if (index === -1) {
            selectedToppings.value.push(topping)
        } else {
            selectedToppings.value.splice(index, 1)
        }
    }

    function isToppingSelected(topping) {
        return selectedToppings.value.some(t => t.id === topping.id)
    }

    function confirmOrder() {
        const toppingPrice = selectedToppings.value.reduce((sum, t) => sum + t.price, 0)
        const toppingNames = selectedToppings.value.map(t => t.name).join(', ')

        const newItem = {
            ...selectedProduct.value,
            price: selectedProduct.value.price + toppingPrice,
            size: selectedSize.value,
            toppings: toppingNames || 'Không có',
        }

        orderedItems.value.push(newItem)

        if (currentOrder.value) {
            currentOrder.value.items = orderedItems.value
        }

        closePopup()
    }

    // ==========================================
    // EXPORT
    // ==========================================
    return {
        searchText,
        products,
        searchProducts,

        showOrderScreen,
        orderList,
        currentOrder,
        createNewOrder,
        selectOrder,

        orderedItems,
        totalPrice,
        removeItem,

        discountInput,
        discountCodeList,
        appliedCode,
        discountPercent,
        discountMessage,
        applyDiscount,
        finalPrice,

        checkout,

        showPopup,
        selectedProduct,
        toppingList,
        selectedToppings,
        selectedSize,
        openPopup,
        closePopup,
        toggleTopping,
        isToppingSelected,
        confirmOrder,
    }
}