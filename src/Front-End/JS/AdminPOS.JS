import { ref, computed } from 'vue'
import axios from 'axios'

export function usePOS() {

  const search = ref("")
  const step = ref(1)
  const orderedItems = ref([])

  const selected = ref({
    bean: null,
    base: null,
    milk: null,
    toppings: []
  })

  /* popup */
  const showBeanPopup    = ref(false)
  const showBasePopup    = ref(false)
  const showMilkPopup    = ref(false)
  const showToppingPopup = ref(false)

  /* PRODUCTS - load từ backend */
  const beans    = ref([])
  const bases    = ref([])
  const milks    = ref([])
  const toppings = ref([])

  const sampleBeans = [
    { name: "Robusta", price: 12000 },
    { name: "Arabica", price: 15000 },
    { name: "Culi",    price: 18000 },
    { name: "Moka",    price: 20000 }
  ]

  const sampleBases = [
    { name: "Espresso (pha máy)",    price: 10000 },
    { name: "Cold Brew (ủ)",         price: 12000 },
    { name: "Pour Over (nhỏ giọt)", price: 15000 }
  ]

  const sampleMilks = [
    { name: "Sữa tươi",   price: 7000  },
    { name: "Sữa hạt",    price: 9000  },
    { name: "Sữa kem béo", price: 10000 },
    { name: "Sữa đặc",    price: 5000  }
  ]

  const sampleToppings = [
    { name: "Trân châu đen",  price: 5000 },
    { name: "Thạch cà phê",   price: 6000 },
    { name: "Kem cheese",     price: 8000 },
    { name: "Pudding trứng",  price: 7000 },
    { name: "Kem béo",        price: 6000 },
    { name: "Machiato",       price: 7000 },
    { name: "Whipping cream", price: 8000 }
  ]

  async function loadProducts() {
    try {
      const [b, ba, m, t] = await Promise.all([
        axios.get("http://localhost:8080/beans"),
        axios.get("http://localhost:8080/bases"),
        axios.get("http://localhost:8080/milks"),
        axios.get("http://localhost:8080/toppings")
      ])
      beans.value    = b.data
      bases.value    = ba.data
      milks.value    = m.data
      toppings.value = t.data
    } catch (err) {
      console.warn("Không kết nối được backend, dùng data mẫu")
      beans.value    = sampleBeans
      bases.value    = sampleBases
      milks.value    = sampleMilks
      toppings.value = sampleToppings
    }
  }

  /* open popup */
  function openBean()    { showBeanPopup.value = true }
  function openBase()    { if (step.value < 2) return; showBasePopup.value = true }
  function openMilk()    { if (step.value < 3) return; showMilkPopup.value = true }
  function openTopping() { if (step.value < 4) return; showToppingPopup.value = true }

  /* select */
  function selectBean(b) {
    selected.value.bean = b
    step.value = 2
    showBeanPopup.value = false
  }

  function selectBase(b) {
    selected.value.base = b
    step.value = 3
    showBasePopup.value = false
  }

  function selectMilk(m) {
    selected.value.milk = m
    step.value = 4
    showMilkPopup.value = false
  }

  function selectTopping(t) {
    if (selected.value.toppings.length >= 3) {
      alert('Chỉ được chọn tối đa 3 topping!')
      return
    }
    selected.value.toppings.push(t)
  }

  function removeTopping(index) {
    selected.value.toppings.splice(index, 1)
  }

  function confirmTopping() {
    if (selected.value.toppings.length === 0) {
      alert('Vui lòng chọn ít nhất 1 topping!')
      return
    }
    showToppingPopup.value = false
    addToCart()
  }

  /* CART */
  function addToCart() {
    const toppingNames = selected.value.toppings.map(t => t.name).join(', ')
    const toppingPrice = selected.value.toppings.reduce((sum, t) => sum + t.price, 0)

    const item = {
      id: Date.now(),
      name:
        selected.value.bean.name + ' + ' +
        selected.value.base.name + ' + ' +
        selected.value.milk.name + ' + ' +
        toppingNames,
      qty: 1,
      price:
        selected.value.bean.price +
        selected.value.base.price +
        selected.value.milk.price +
        toppingPrice
    }

    orderedItems.value.push(item)
    selected.value = { bean: null, base: null, milk: null, toppings: [] }
    step.value = 1
  }

  /* DISCOUNT */
  const discountCodes = { 'KM50': 50, 'KM20': 20, 'KM10': 10 }
  const discountInput   = ref('')
  const appliedCode     = ref('')
  const discountPercent = ref(0)
  const discountMessage = ref('')

  function applyDiscount() {
    const code = discountInput.value.trim().toUpperCase()
    if (discountCodes[code]) {
      appliedCode.value     = code
      discountPercent.value = discountCodes[code]
      discountMessage.value = `Áp dụng thành công! Giảm ${discountCodes[code]}%`
    } else {
      appliedCode.value     = ''
      discountPercent.value = 0
      discountMessage.value = 'Mã không hợp lệ!'
    }
  }

  const totalPrice = computed(() =>
    orderedItems.value.reduce((sum, item) => sum + item.price, 0)
  )

  const finalPrice = computed(() => {
    if (discountPercent.value === 0) return totalPrice.value
    return totalPrice.value * (1 - discountPercent.value / 100)
  })

  function removeItem(index) { orderedItems.value.splice(index, 1) }

  /* Thanh toán - gửi lên backend */
  async function checkout() {
    if (orderedItems.value.length === 0) {
      alert('Chưa có sản phẩm nào!')
      return
    }
    const payload = {
      items:          orderedItems.value,
      totalPrice:     totalPrice.value,
      discountCode:   appliedCode.value,
      discountPercent: discountPercent.value,
      finalPrice:     finalPrice.value
    }
    try {
      // Khi có backend: bỏ comment dòng dưới
      // await axios.post("http://localhost:8080/orders", payload)
      alert(`Thanh toán thành công! Tổng tiền: ${finalPrice.value.toLocaleString()} VND`)
    } catch (err) {
      alert('Thanh toán thất bại, vui lòng thử lại!')
      return
    }
    orderedItems.value  = []
    discountInput.value = ''
    appliedCode.value   = ''
    discountPercent.value = 0
    discountMessage.value = ''
  }

  function searchProduct() {}

  return {
    search, step, selected,
    beans, bases, milks, toppings,
    loadProducts,
    orderedItems,
    showBeanPopup, showBasePopup, showMilkPopup, showToppingPopup,
    openBean, openBase, openMilk, openTopping,
    selectBean, selectBase, selectMilk, selectTopping,
    removeTopping, confirmTopping,
    removeItem,
    discountInput, discountPercent, discountMessage,
    totalPrice, finalPrice, applyDiscount, checkout,
    searchProduct
  }
}