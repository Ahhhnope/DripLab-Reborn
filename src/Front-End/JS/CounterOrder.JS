import { ref, computed } from 'vue'
function getImg(filename) {
    return new URL(`../IMG/${filename}`, import.meta.url).href
}


export function useCounterOrder() {
    const searchText = ref('')

    // Danh sách sản phẩm mẫu 
    const allProducts = ref([
        { id: 0, name: 'CUSTOM', image: getImg('Matcha-latte.png'), price: 0 },
        { id: 1, name: 'Matcha Tea', image: '/IMG/Matcha-latte.png', price: 45000 },
        { id: 2, name: 'Classic Latte', image: '/IMG/mocha.jpg', price: 45000 },
        { id: 3, name: 'Robusta', image: '/IMG/robusta.jpg', price: 45000 },
        { id: 4, name: 'Oolong', image: '/IMG/oolong.png', price: 45000 },
        { id: 5, name: 'Milk', image: '/IMG/milk.jpg', price: 45000 },
        { id: 6, name: 'Hojicha', image: '/IMG/Hojicha-roasted.png', price: 45000 },
        { id: 7, name: 'Geisha', image: '/IMG/geisha.png', price: 45000 },
        { id: 8, name: 'Moka', image: '/IMG/moka.jpg', price: 45000 },
    ])
    // Danh sách hiển thị (lọc theo tìm kiếm)
    const products = ref([...allProducts.value])

    // Danh sách món đã gọi
    const orderedItems = ref([])

    // Tính tổng tiền trước giảm giá
    const totalPrice = computed(() => {
        return orderedItems.value.reduce((sum, item) => sum + item.price, 0)
    })

    // ====== MÃ KHUYẾN MÃI ======

    // Danh sách mã khuyến mãi hợp lệ: 
    const discountCodes = {
        'KM50': 50,   // giảm 50%
        'KM20': 20,   // giảm 20%
        'KM10': 10,   // giảm 10%
    }

    // Mã người dùng đang nhập
    const discountInput = ref('')

    // Mã đã được áp dụng thành công
    const appliedCode = ref('')

    // % giảm hiện tại (0 = chưa áp dụng)
    const discountPercent = ref(0)

    // Thông báo lỗi mã
    const discountMessage = ref('')

    // Bấm "Áp dụng" mã khuyến mãi
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
    }

    // Tổng tiền sau khi giảm
    const finalPrice = computed(() => {
        if (discountPercent.value === 0) return totalPrice.value
        return totalPrice.value * (1 - discountPercent.value / 100)
    })

    // ====== Kết thúc MÃ KHUYẾN MÃI ======

    // Tìm kiếm sản phẩm
    function searchProducts() {
        const keyword = searchText.value.toLowerCase()
        if (keyword === '') {
            products.value = [...allProducts.value]
        } else {
            products.value = allProducts.value.filter(p =>
                p.name.toLowerCase().includes(keyword)
            )
        }
    }

    // Xóa món khỏi đơn
    function removeItem(index) {
        orderedItems.value.splice(index, 1)
    }

    // Thanh toán
    function checkout() {
        if (orderedItems.value.length === 0) {
            alert('Chưa có sản phẩm nào!')
            return
        }
        alert(`Thanh toán thành công! Tổng tiền: ${finalPrice.value.toLocaleString()} VND`)
        orderedItems.value = []
        discountInput.value = ''
        appliedCode.value = ''
        discountPercent.value = 0
        discountMessage.value = ''
    }

    // ====== Cửa sổ - POPUP ======

    const showPopup = ref(false)
    const selectedProduct = ref(null)

    const toppingList = [
        { id: 1, name: 'Trân châu đen', price: 5000 },
        { id: 2, name: 'Thạch cà phê', price: 5000 },
        { id: 3, name: 'Kem cheese', price: 8000 },
        { id: 4, name: 'Pudding trứng', price: 8000 },
        { id: 5, name: 'Kem béo', price: 6000 },
        { id: 6, name: 'Kem cheese', price: 10000 },
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

        orderedItems.value.push({
            ...selectedProduct.value,
            price: selectedProduct.value.price + toppingPrice,
            size: selectedSize.value,
            toppings: toppingNames || 'Không có',
        })
        closePopup()
    }

    // ====== Kết thúc cửa sổ======

    return {
        searchText, // Tìm kiếm tên sản phầm
        products, // Danh sách sản phẩm hiển thị
        orderedItems, // Danh sách món đã gọi
        totalPrice, // Tổng tiền gốc
        finalPrice, // Tổng tiền sau khi giảm
        searchProducts, // Hàm tìm kiếm sản phẩm
        removeItem, // Hàm xóa món khỏi đơn
        checkout, // Thanh toán
        // mã khuyến mãi
        discountInput, // Mã khuyến mãi đang nhập
        appliedCode, // Mã đã được áp dụng thành công
        discountPercent, // % giảm giá hiện tại
        discountMessage, // Thông báo mã đúng/sai
        applyDiscount, // Hàm áp dụng mã khuyến mãi
        // popup - Cửa sổ mở ra
        showPopup, // Cửa sổ đang hiện hoặc ẩn
        selectedProduct, // Sản phẩm đang được chọn trong cửa sổ
        toppingList, // Danh sách topping
        selectedToppings, // Danh sách topping đã chọn
        selectedSize, // Size đã chọn (M hoặc L)
        openPopup, // Mở cửa sổ
        closePopup, //đóng cửa sổ
        toggleTopping, // Hàm bật/tắt chọn topping
        isToppingSelected, // Kiểm tra topping có đang được chọn không
        confirmOrder, //Hàm xác nhận thêm món vào đơn
    }
}