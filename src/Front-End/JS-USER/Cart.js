import { useCartStore } from '../../stores/cart.js'
import { useAuthStore } from '../Authorization/Auth.js'
import api from '../../api/axios'

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

export default {
  name: 'CartApp',

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

      showOrderModal: false,
      paymentMethod: 'COD',

      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      couponMessage: '',

      momoPhone: '',
      momoName: '',
      momoStep: 1,
      momoError: '',
      momoLoading: false,

      isPlacingOrder: false,
      showSuccessModal: false,
      lastOrderId: '',
      orderNote: '',
    }
  },

  computed: {
    cartItems() {
      return this.cartStore.items.map((item) => ({
        id: item.id,
        productId: item.drinkId,
        name: item.drink?.name || 'Drink',
        image: item.drink?.imageUrl || '/placeholder.png',
        drinkBasePrice: item.drink?.basePrice || 0,
        sizePrice: item.size?.price || 0,
        sizeName: item.size?.name || '',
        toppingPrice: item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0,
        // basePrice = drinkBase + size + toppings
        basePrice:
          (item.drink?.basePrice || 0) +
          (item.size?.price || 0) +
          (item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0),
        quantity: item.quantity,
        sugar: item.sugar || '100%',
        ice: item.ice || '100%',
        toppings: item.toppings?.map((t) => t.topping?.name).filter(Boolean) || []
      }))
    },

    selectedItems() {
      return this.cartItems.filter(item => this.selectedIds.includes(item.id))
    },

    selectedSubtotal() {
      return this.selectedItems.reduce((s, i) => s + i.basePrice * i.quantity, 0)
    },

    shippingFee() {
      if (!this.selectedItems.length) return 0
      return this.selectedSubtotal >= 100000 ? 0 : 20000
    },

    selectedTotal() {
      return this.selectedSubtotal + this.shippingFee
    },

    grandTotal() {
      return Math.max(0, this.selectedTotal - this.couponDiscount)
    },

    isAllSelected() {
      return this.cartItems.length > 0 &&
        this.cartItems.every(i => this.selectedIds.includes(i.id))
    },

    isSomeSelected() {
      return this.selectedIds.length > 0 && !this.isAllSelected
    },
  },

  async created() {
    const userId = this.authStore.user?.id
    if (userId) {
      await this.cartStore.fetchUserCart(userId)
      this.selectedIds = this.cartItems.map((i) => i.id)
    }
  },

  unmounted() {
    document.body.style.overflow = ''
  },

  methods: {
    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount)
    },

    toggleSelect(item) {
      if (this.selectedIds.includes(item.id)) {
        // Remove if already selected
        this.selectedIds = this.selectedIds.filter(id => id !== item.id);
      } else {
        // Add if not selected
        this.selectedIds.push(item.id);
      }
    },

    isItemSelected(item) {
      return this.selectedIds.includes(item.id);
    },

    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.cartItems.map((i) => i.id) : []
    },

    async increaseQty(item) {
      const newQty = item.quantity + 1
      try {
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: newQty })
        const storeItem = this.cartStore.items.find(i => i.id === item.id)
        if (storeItem) storeItem.quantity = newQty
      } catch (e) {
        console.error('Quantity update failed:', e)
      }
    },

    async decreaseQty(item) {
      if (item.quantity <= 1) return
      const newQty = item.quantity - 1
      try {
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: newQty })
        const storeItem = this.cartStore.items.find(i => i.id === item.id)
        if (storeItem) storeItem.quantity = newQty
      } catch (e) {
        console.error('Quantity update failed:', e)
      }
    },

    confirmDelete(item) { this.deleteTarget = item },
    cancelDelete() { this.deleteTarget = null },

    async executeDelete() {
      if (!this.deleteTarget) return
      try {
        await api.delete(`/carts/remove/${this.deleteTarget.id}`)
        this.cartStore.items = this.cartStore.items.filter(i => i.id !== this.deleteTarget.id)
        this.selectedIds = this.selectedIds.filter(id => id !== this.deleteTarget.id)
      } catch (e) {
        console.error('Delete failed:', e)
      }
      this.deleteTarget = null
    },

    openOrderModal() {
      if (!this.selectedItems.length) return
      this.paymentMethod = 'COD'
      this.resetMomo()
      this.showOrderModal = true
      document.body.style.overflow = 'hidden'
    },

    closeOrderModal() {
      this.showOrderModal = false
      this.paymentMethod = 'COD'
      this.resetMomo()
      document.body.style.overflow = ''
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
      this.couponCode = ''
      this.couponApplied = false
      this.couponDiscount = 0
      this.couponMessage = ''
    },

    openMomoFlow() { this.resetMomo(); this.paymentMethod = 'MOMO' },
    backToPaymentSelect() { this.paymentMethod = 'COD'; this.resetMomo() },

    resetMomo() {
      this.momoPhone = ''; this.momoName = ''
      this.momoStep = 1; this.momoError = ''; this.momoLoading = false
    },

    onMomoPhoneInput(e) {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 10)
      this.momoPhone = clean
      this.momoError = ''; this.momoName = ''; this.momoLoading = false
      if (clean.length === 10) {
        this.momoLoading = true
        setTimeout(() => {
          this.momoLoading = false
          if (MOMO_ACCOUNTS[clean]) {
            this.momoName = MOMO_ACCOUNTS[clean]; this.momoError = ''
          } else {
            this.momoName = ''; this.momoError = 'Không tìm thấy tên tài khoản'
          }
        }, 900)
      }
    },

    confirmMomoReceiver() {
      if (!this.momoName) return
      this.momoStep = 2
    },

async placeOrder() {
  this.isPlacingOrder = true
  try {
    const selectedCartItemIds = this.selectedItems.map(i => i.id)

    // ✅ Dùng orderNote của user nếu có, không thì dùng mặc định
    const baseNote = this.paymentMethod === 'MOMO' ? 'POS MoMo' : 'Online Order'
    const finalNote = this.orderNote.trim()
      ? `${baseNote} - ${this.orderNote.trim()}`
      : baseNote

    const response = await api.post(
      `/carts/user/${this.authStore.user.id}/checkout-selected`,
      {
        cartItemIds: selectedCartItemIds,
        note: this.couponApplied
          ? `${finalNote} - Coupon: ${this.couponCode}`
          : finalNote,
        paymentMethod: this.paymentMethod === 'COD' ? 'Tiền mặt' : 'MoMo',
      }
    )

    this.lastOrderId = response.data.orderNumber || response.data.id || 'N/A'
    this.showOrderModal = false
    this.showSuccessModal = true

    this.cartStore.items = this.cartStore.items.filter(
      i => !selectedCartItemIds.includes(i.id)
    )
    this.selectedIds = this.selectedIds.filter(
      id => !selectedCartItemIds.includes(id)
    )

    // ✅ Reset cả orderNote
    this.couponCode = ''
    this.couponApplied = false
    this.couponDiscount = 0
    this.couponMessage = ''
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
      this.orderNote = ''
    },
  },
  // ✅ Xóa các item đang được selected
confirmDeleteSelected() {
  if (!this.selectedIds.length) return
  this.showDeleteSelected = true
},

cancelDeleteSelected() {
  this.showDeleteSelected = false
},

async executeDeleteSelected() {
  const idsToDelete = [...this.selectedIds]
  try {
    // Xóa từng item một
    for (const id of idsToDelete) {
      await api.delete(`/carts/remove/${id}`)
    }
    // Xóa khỏi store
    this.cartStore.items = this.cartStore.items.filter(
      i => !idsToDelete.includes(i.id)
    )
    // Xóa khỏi selectedIds
    this.selectedIds = this.selectedIds.filter(
      id => !idsToDelete.includes(id)
    )
  } catch (e) {
    console.error('Delete selected failed:', e)
    alert('Có lỗi khi xóa sản phẩm, vui lòng thử lại!')
  }
  this.showDeleteSelected = false
},
}