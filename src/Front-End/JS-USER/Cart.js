import { useCartStore } from '../../stores/cart.js'
import { useAuthStore } from '../Authorization/Auth.js'
import api from '../../api/axios'
import MomoPopup from '../QRMoMo/Momo.vue'

function getImageUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

export default {
  name: 'CartApp',
  components: { MomoPopup },

  setup() {
    const cartStore = useCartStore()
    const authStore = useAuthStore()
    return { cartStore, authStore }
  },

  data() {
    return {
      selectedIds: [],
      deleteTarget: null,
      showDeleteSelected: false,

      showCustomerInfoModal: false,
      customerInfoName: '',
      customerInfoPhone: '',
      customerInfoAddress: '',
      customerInfoErrors: { name: '', phone: '', address: '' },

      // ✅ Địa chỉ GPS lấy từ trang chọn cửa hàng (lưu trong sessionStorage)
      gpsLocationText: sessionStorage.getItem('userLocationText') || '',

      // Popup 2: Xác nhận đơn hàng
      showOrderModal: false,
      paymentMethod: 'COD',
      orderNote: '',

      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      couponMessage: '',

      isPlacingOrder: false,
      showSuccessModal: false,
      lastOrderId: '',

      // ✅ MoMo QR mới
      showMomoQR: false,
    }
  },

  computed: {
    cartItems() {
      return this.cartStore.items.map((item) => ({
        id: item.id,
        productId: item.drinkId,
        name: item.drink?.name || 'Drink',
        image: getImageUrl(item.drink?.imageUrl) || '/placeholder.png',
        drinkBasePrice: item.drink?.basePrice || 0,
        sizePrice: item.size?.price || 0,
        sizeName: item.size?.name || '',
        toppingPrice: item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0,
        // ✅ Chi tiết từng topping với giá riêng
        toppingDetails: item.toppings?.map((t) => ({
          name: t.topping?.name || '',
          price: t.topping?.price || 0,
        })).filter(t => t.name) || [],
        basePrice:
          (item.drink?.basePrice || 0) +
          (item.size?.price || 0) +
          (item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0),
        quantity: item.quantity,
        sugar: item.sugar || '100',
        ice: item.ice || '100',
        toppings: item.toppings?.map((t) => t.topping?.name).filter(Boolean) || [],

        isCustom: item.isCustom || false,
        beanName: item.coffeeBean?.name || null,
        baseName: item.base || null,
        milkName: item.milk?.name || null,
      }))
    },

    selectedItems() {
      return this.cartItems.filter(i => this.selectedIds.includes(i.id))
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((s, i) => s + i.basePrice * i.quantity, 0)
    },
    shippingFee() {
      if (!this.selectedItems.length) return 0
      return this.selectedSubtotal >= 100000 ? 0 : 20000
    },
    selectedTotal() { return this.selectedSubtotal + this.shippingFee },
    grandTotal() { return Math.max(0, this.selectedTotal - this.couponDiscount) },
    isAllSelected() {
      return this.cartItems.length > 0 && this.cartItems.every(i => this.selectedIds.includes(i.id))
    },
    isSomeSelected() {
      return this.selectedIds.length > 0 && !this.isAllSelected
    },
  },

  async created() {
    const userId = this.authStore.user?.id
    if (userId) {
      await this.cartStore.fetchUserCart(userId)
      this.selectedIds = this.cartItems.map(i => i.id)
    }
  },

  unmounted() { document.body.style.overflow = '' },

  methods: {
    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND', maximumFractionDigits: 0,
      }).format(amount)
    },

    toggleSelect(item) {
      if (this.selectedIds.includes(item.id)) {
        this.selectedIds = this.selectedIds.filter(id => id !== item.id)
      } else {
        this.selectedIds.push(item.id)
      }
    },
    isItemSelected(item) { return this.selectedIds.includes(item.id) },
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.cartItems.map(i => i.id) : []
    },

    async increaseQty(item) {
      const newQty = item.quantity + 1
      try {
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: newQty })
        const storeItem = this.cartStore.items.find(i => i.id === item.id)
        if (storeItem) storeItem.quantity = newQty
      } catch (e) { console.error(e) }
    },
    async decreaseQty(item) {
      if (item.quantity <= 1) return
      const newQty = item.quantity - 1
      try {
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: newQty })
        const storeItem = this.cartStore.items.find(i => i.id === item.id)
        if (storeItem) storeItem.quantity = newQty
      } catch (e) { console.error(e) }
    },

    confirmDelete(item) { this.deleteTarget = item },
    cancelDelete() { this.deleteTarget = null },
    async executeDelete() {
      if (!this.deleteTarget) return
      try {
        await api.delete(`/carts/remove/${this.deleteTarget.id}`)
        this.cartStore.items = this.cartStore.items.filter(i => i.id !== this.deleteTarget.id)
        this.selectedIds = this.selectedIds.filter(id => id !== this.deleteTarget.id)
      } catch (e) { console.error(e) }
      this.deleteTarget = null
    },

    confirmDeleteSelected() { if (this.selectedIds.length) this.showDeleteSelected = true },
    cancelDeleteSelected() { this.showDeleteSelected = false },
    async executeDeleteSelected() {
      for (const id of [...this.selectedIds]) {
        try {
          await api.delete(`/carts/remove/${id}`)
          this.cartStore.items = this.cartStore.items.filter(i => i.id !== id)
        } catch (e) { console.error(e) }
      }
      this.selectedIds = []
      this.showDeleteSelected = false
    },

    // ✅ Popup 1: Thông tin khách hàng
    openCustomerInfoModal() {
      if (!this.selectedItems.length) return
      this.customerInfoErrors = { name: '', phone: '', address: '' }

      // ✅ Refresh địa chỉ GPS mỗi lần mở popup (phòng trường hợp user vừa chọn vị trí)
      this.gpsLocationText = sessionStorage.getItem('userLocationText') || ''

      const user = this.authStore.user
      if (user) {
        this.customerInfoName = user.fullName || user.full_name || ''
        this.customerInfoPhone = user.phone || ''
        this.customerInfoAddress = user.defaultAddress || user.default_address || ''
      }

      this.showCustomerInfoModal = true
      document.body.style.overflow = 'hidden'
    },
    closeCustomerInfoModal() {
      this.showCustomerInfoModal = false
      document.body.style.overflow = ''
    },
    onCustomerPhoneInput(e) {
      this.customerInfoPhone = e.target.value.replace(/\D/g, '').slice(0, 10)
      e.target.value = this.customerInfoPhone
    },

    // ✅ Dùng địa chỉ GPS từ trang chọn cửa hàng để điền vào ô địa chỉ giao hàng
    useGpsLocation() {
      if (this.gpsLocationText) {
        this.customerInfoAddress = this.gpsLocationText
        // Xóa lỗi nếu trước đó có
        if (this.customerInfoErrors.address) {
          this.customerInfoErrors.address = ''
        }
      }
    },

    validateCustomerInfo() {
      let valid = true
      this.customerInfoErrors = { name: '', phone: '', address: '' }
      if (!this.customerInfoName.trim()) {
        this.customerInfoErrors.name = 'Vui lòng nhập họ và tên'
        valid = false
      }
      if (!this.customerInfoPhone || this.customerInfoPhone.length < 10) {
        this.customerInfoErrors.phone = 'Số điện thoại phải đủ 10 số'
        valid = false
      }
      if (!this.customerInfoAddress.trim()) {
        this.customerInfoErrors.address = 'Vui lòng nhập địa chỉ giao hàng'
        valid = false
      }
      return valid
    },
    submitCustomerInfo() {
      if (!this.validateCustomerInfo()) return
      this.showCustomerInfoModal = false
      this.paymentMethod = 'COD'
      this.showOrderModal = true
    },
    backToCustomerInfo() {
      this.showOrderModal = false
      this.showCustomerInfoModal = true
    },

    // Popup 2: Đơn hàng
    closeOrderModal() {
      this.showOrderModal = false
      this.paymentMethod = 'COD'
      document.body.style.overflow = ''
    },

    // ✅ MoMo flow mới
    openMomoFlow() {
      this.paymentMethod = 'MOMO'
      this.showOrderModal = false
      this.showMomoQR = true
    },
    closeMomoQR() {
      this.showMomoQR = false
      this.showOrderModal = true
      this.paymentMethod = 'COD'
    },
    async onMomoPaid() {
      // MoMo thanh toán xong → đặt hàng luôn
      this.showMomoQR = false
      this.paymentMethod = 'MOMO'
      await this.placeOrder()
    },

    applyCoupon() {
      if (!this.couponCode.trim()) return
      const code = this.couponCode.toUpperCase()
      if (code === 'CAFE10') {
        this.couponDiscount = Math.round(this.selectedSubtotal * 0.1)
        this.couponApplied = true
        this.couponMessage = `✓ Giảm 10%! (-${this.formatVND(this.couponDiscount)})`
      } else if (code === 'FREESHIP') {
        this.couponDiscount = 20000
        this.couponApplied = true
        this.couponMessage = `✓ Miễn phí vận chuyển! (-${this.formatVND(20000)})`
      } else {
        this.couponDiscount = 0
        this.couponApplied = false
        this.couponMessage = 'Mã giảm giá không hợp lệ.'
      }
    },
    removeCoupon() {
      this.couponCode = ''; this.couponApplied = false
      this.couponDiscount = 0; this.couponMessage = ''
    },

    async placeOrder() {
      this.isPlacingOrder = true
      try {
        const selectedCartItemIds = this.selectedItems.map(i => i.id)
        const response = await api.post(
          `/carts/user/${this.authStore.user.id}/checkout-selected`,
          {
            cartItemIds: selectedCartItemIds,
            note: this.orderNote
              ? (this.couponApplied ? `Online Order - ${this.orderNote} - Coupon: ${this.couponCode}` : `Online Order - ${this.orderNote}`)
              : (this.couponApplied ? `Online Order - Coupon: ${this.couponCode}` : 'Online Order'),
            paymentMethod: this.paymentMethod === 'COD' ? 'Tiền mặt' : 'MoMo',
            customerName: this.customerInfoName,
            customerPhone: this.customerInfoPhone,
            deliveryAddress: this.customerInfoAddress,
          }
        )
        this.lastOrderId = response.data.orderNumber || response.data.id || 'N/A'
        this.showOrderModal = false
        this.showSuccessModal = true

        this.cartStore.items = this.cartStore.items.filter(
          i => !selectedCartItemIds.includes(i.id)
        )
        this.selectedIds = this.selectedIds.filter(id => !selectedCartItemIds.includes(id))
        this.couponCode = ''; this.couponApplied = false
        this.couponDiscount = 0; this.couponMessage = ''
        this.orderNote = ''
      } catch (error) {
        console.error('Lỗi checkout:', error)
        const msg = error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại!'
        alert(msg)
      } finally {
        this.isPlacingOrder = false
      }
    },

    closeSuccessModal() {
      this.showSuccessModal = false
      document.body.style.overflow = ''
      this.$router.push('/menu')
    },
  },
}