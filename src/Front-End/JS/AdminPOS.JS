import { ref, computed } from 'vue'
import api from '../../api/axios'

const DISCOUNT_CODES = { KM50: 50, KM20: 20, KM10: 10 }

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

export function usePOS() {

  const search = ref('')
  const step   = ref(1)
  const orderedItems = ref([])

  const selected = ref({
    bean: null, base: null, milk: null, toppings: []
  })

  const showBeanPopup    = ref(false)
  const showBasePopup    = ref(false)
  const showMilkPopup    = ref(false)
  const showToppingPopup = ref(false)

  const beans = ref([])
  const bases = ref([])
  const milks = ref([])
  const toppings = ref([])

  // const sampleBeans = [
  //   { name: 'Robusta', price: 12000 },
  //   { name: 'Arabica', price: 15000 },
  //   { name: 'Culi',    price: 18000 },
  //   { name: 'Moka',    price: 20000 }
  // ]
  // const sampleBases = [
  //   { name: 'Espresso (pha máy)',   price: 10000 },
  //   { name: 'Cold Brew (ủ)',        price: 12000 },
  //   { name: 'Pour Over (nhỏ giọt)', price: 15000 }
  // ]
  // const sampleMilks = [
  //   { name: 'Sữa tươi',    price: 7000  },
  //   { name: 'Sữa hạt',     price: 9000  },
  //   { name: 'Sữa kem béo', price: 10000 },
  //   { name: 'Sữa đặc',     price: 5000  }
  // ]
  // const sampleToppings = [
  //   { name: 'Trân châu đen',  price: 5000 },
  //   { name: 'Thạch cà phê',   price: 6000 },
  //   { name: 'Kem cheese',     price: 8000 },
  //   { name: 'Pudding trứng',  price: 7000 },
  //   { name: 'Kem béo',        price: 6000 },
  //   { name: 'Machiato',       price: 7000 },
  //   { name: 'Whipping cream', price: 8000 }
  // ]
  async function loadProducts() {
    try {
      const [resBeans, resBases, resMilks, resToppings] = await Promise.all([
        api.get('/ingredients/coffee-beans'), // Matches backend case
        api.get('/ingredients/heavy-creams'), // Matches backend case
        api.get('/ingredients/milks'),        // Matches backend case
        api.get('/ingredients/toppings')      // Matches backend case
      ]);

      beans.value = resBeans.data;
      bases.value = resBases.data;
      milks.value = resMilks.data;
      toppings.value = resToppings.data;
    } catch (err) {
      // Fallback logic
    }
  }

  function openBean()    { showBeanPopup.value = true }
  function openBase()    { if (step.value < 2) return; showBasePopup.value = true }
  function openMilk()    { if (step.value < 3) return; showMilkPopup.value = true }
  function openTopping() { if (step.value < 4) return; showToppingPopup.value = true }

  function selectBean(b) { selected.value.bean = b; step.value = 2; showBeanPopup.value = false }
  function selectBase(b) { selected.value.base = b; step.value = 3; showBasePopup.value = false }
  function selectMilk(m) { selected.value.milk = m; step.value = 4; showMilkPopup.value = false }

  function selectTopping(t) {
    if (selected.value.toppings.length >= 3) { alert('Chỉ được chọn tối đa 3 topping!'); return }
    selected.value.toppings.push(t)
  }

  function removeTopping(index) { selected.value.toppings.splice(index, 1) }

  function confirmTopping() {
    if (selected.value.toppings.length === 0) { alert('Vui lòng chọn ít nhất 1 topping!'); return }
    showToppingPopup.value = false
    addToCart()
  }

  function addToCart() {
    const toppingNames = selected.value.toppings.map(t => t.name).join(', ')
    const toppingPrice = selected.value.toppings.reduce((s, t) => s + t.price, 0)
    orderedItems.value.push({
      id: Date.now(),
      name: `${selected.value.bean.name} + ${selected.value.base.name} + ${selected.value.milk.name} + ${toppingNames}`,
      qty: 1,
      price: selected.value.bean.price + selected.value.base.price + selected.value.milk.price + toppingPrice
    })
    selected.value = { bean: null, base: null, milk: null, toppings: [] }
    step.value = 1
  }

  /* ── DISCOUNT ── */
  const discountInput   = ref('')
  const appliedCode     = ref('')
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
      appliedCode.value     = code
      discountPercent.value = DISCOUNT_CODES[code]
      discountMessage.value = `Áp dụng thành công! Giảm ${DISCOUNT_CODES[code]}%`
    } else {
      appliedCode.value = ''; discountPercent.value = 0
      discountMessage.value = 'Mã không hợp lệ!'
    }
  }

  const totalPrice = computed(() =>
    orderedItems.value.reduce((s, i) => s + i.price * i.qty, 0)
  )

  const finalPrice = computed(() =>
    discountPercent.value
      ? totalPrice.value * (1 - discountPercent.value / 100)
      : totalPrice.value
  )

  function removeItem(index) { orderedItems.value.splice(index, 1) }

  /* ── PAYMENT ── */
  const showPaymentPopup = ref(false)
  const showSuccessPopup = ref(false)
  const paymentMethod    = ref('cash')
  const customerMoney    = ref('')
  const txId             = ref('')
  const txTime           = ref('')

  const changeAmount = computed(() =>
    Math.max(0, (parseInt(customerMoney.value) || 0) - finalPrice.value)
  )

  function checkout() {
    if (!orderedItems.value.length) { alert('Chưa có sản phẩm nào!'); return }
    customerMoney.value = ''
    paymentMethod.value = 'cash'
    resetMomo()
    showPaymentPopup.value = true
  }

  function confirmPayment() {
    txId.value  = genTxId()
    txTime.value = new Date().toLocaleString('vi-VN')
    showPaymentPopup.value = false
    showSuccessPopup.value = true
  }

  function closePaymentPopup() { showPaymentPopup.value = false }

  function closeSuccessPopup() {
    showSuccessPopup.value = false
    orderedItems.value  = []
    discountInput.value = ''
    appliedCode.value   = ''
    discountPercent.value = 0
    discountMessage.value = ''
  }

  /* ── MOMO ── */
  const momoPhone   = ref('')
  const momoName    = ref('')
  const momoStep    = ref(1)
  const momoError   = ref('')
  const momoLoading = ref(false)

  function resetMomo() {
    momoPhone.value = ''; momoName.value = ''
    momoStep.value = 1; momoError.value = ''; momoLoading.value = false
  }

  function onMomoPhoneInput(e) {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10)
    momoPhone.value = clean; momoError.value = ''
    momoName.value = ''; momoLoading.value = false
    if (clean.length === 10) {
      momoLoading.value = true
      setTimeout(() => {
        momoLoading.value = false
        if (MOMO_ACCOUNTS[clean]) { momoName.value = MOMO_ACCOUNTS[clean]; momoError.value = '' }
        else { momoName.value = ''; momoError.value = 'Không tìm thấy tên tài khoản' }
      }, 900)
    }
  }

  function confirmMomoReceiver() { if (!momoName.value) return; momoStep.value = 2 }
  function backMomo() { momoStep.value = 1 }
  function searchProduct() {}

  return {
    search, step, selected,
    beans, bases, milks, toppings, loadProducts,
    orderedItems,
    showBeanPopup, showBasePopup, showMilkPopup, showToppingPopup,
    openBean, openBase, openMilk, openTopping,
    selectBean, selectBase, selectMilk, selectTopping,
    removeTopping, confirmTopping, removeItem,
    discountInput, discountCodeList, appliedCode, discountPercent, discountMessage,
    totalPrice, finalPrice, applyDiscount,
    checkout, showPaymentPopup, paymentMethod, customerMoney, changeAmount,
    confirmPayment, closePaymentPopup,
    showSuccessPopup, closeSuccessPopup, txId, txTime,
    momoPhone, momoName, momoStep, momoError, momoLoading,
    onMomoPhoneInput, confirmMomoReceiver, backMomo,
    searchProduct,
  }
}