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
    }
  },

  computed: {
    // ✅ Map raw cart items
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
        // ✅ basePrice = drinkBase + size + toppings
        basePrice:
          (item.drink?.basePrice || 0) +
          (item.size?.price || 0) +
          (item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0),
        quantity: item.quantity,
        sugar: item.sugar || '100%',
        ice: item.ice || '100%',
        toppings: item.toppings?.map((t) => t.topping?.name).filter(Boolean) || [],
        // ✅ Key để gộp các đơn giống nhau
        mergeKey: [
          item.drinkId,
          item.size?.id || '',
          item.sugar || '',
          item.ice || '',
          (item.toppings?.map(t => t.topping?.id).sort().join(',') || '')
        ].join('|')
      }))
    },

    // ✅ Gộp các đơn hàng giống nhau
    mergedCartItems() {
      const map = new Map()
      for (const item of this.cartItems) {
        if (map.has(item.mergeKey)) {
          const existing = map.get(item.mergeKey)
          existing.quantity += item.quantity
          existing.ids.push(item.id)
        } else {
          map.set(item.mergeKey, { ...item, ids: [item.id] })
        }
      }
      return Array.from(map.values())
    },

    selectedItems() {
      // ✅ Chỉ lấy các item có id trong selectedIds
      return this.mergedCartItems.filter(item =>
        item.ids.some(id => this.selectedIds.includes(id))
      )
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

    // ✅ Toggle chọn theo mergedItem (chọn/bỏ tất cả ids trong group)
    toggleSelect(mergedItem) {
      const allSelected = mergedItem.ids.every(id => this.selectedIds.includes(id))
      if (allSelected) {
        this.selectedIds = this.selectedIds.filter(id => !mergedItem.ids.includes(id))
      } else {
        const toAdd = mergedItem.ids.filter(id => !this.selectedIds.includes(id))
        this.selectedIds.push(...toAdd)
      }
    },

    isItemSelected(mergedItem) {
      return mergedItem.ids.every(id => this.selectedIds.includes(id))
    },

    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.cartItems.map((i) => i.id) : []
    },

    async increaseQty(item) {
      // ✅ Tăng quantity của tất cả ids trong group
      for (const id of item.ids) {
        const storeItem = this.cartStore.items.find(i => i.id === id)
        if (storeItem) {
          const newQty = storeItem.quantity + 1
          try {
            await api.put(`/carts/items/${id}/quantity`, { quantity: newQty })
            storeItem.quantity = newQty
          } catch (e) {
            console.error('Quantity update failed:', e)
          }
        }
      }
    },

    async decreaseQty(item) {
      for (const id of item.ids) {
        const storeItem = this.cartStore.items.find(i => i.id === id)
        if (storeItem && storeItem.quantity > 1) {
          const newQty = storeItem.quantity - 1
          try {
            await api.put(`/carts/items/${id}/quantity`, { quantity: newQty })
            storeItem.quantity = newQty
          } catch (e) {
            console.error('Quantity update failed:', e)
          }
        }
      }
    },

    confirmDelete(item) { this.deleteTarget = item },
    cancelDelete() { this.deleteTarget = null },

    async executeDelete() {
      if (!this.deleteTarget) return
      // ✅ Xóa tất cả ids trong group
      for (const id of this.deleteTarget.ids) {
        try {
          await api.delete(`/carts/remove/${id}`)
          this.cartStore.items = this.cartStore.items.filter(i => i.id !== id)
          this.selectedIds = this.selectedIds.filter(s => s !== id)
        } catch (e) {
          console.error('Delete failed:', e)
        }
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
        // ✅ Chỉ gửi selectedIds lên backend
        const selectedCartItemIds = this.selectedItems.flatMap(i => i.ids)

        const orderNote = this.paymentMethod === 'MOMO' ? 'POS MoMo' : 'Online Order'
        const response = await api.post(`/orders/checkout/${this.authStore.user.id}`, {
          cartItemIds: selectedCartItemIds, // ✅ gửi đúng items được chọn
          note: this.couponApplied
            ? `${orderNote} - Coupon: ${this.couponCode}`
            : orderNote,
          paymentMethod: this.paymentMethod === 'COD' ? 'Tiền mặt' : 'MoMo',
        })

        this.lastOrderId = response.data.orderNumber
        this.showOrderModal = false
        this.showSuccessModal = true

        // ✅ Chỉ xóa các item đã thanh toán khỏi store
        this.cartStore.items = this.cartStore.items.filter(
          i => !selectedCartItemIds.includes(i.id)
        )
        this.selectedIds = this.selectedIds.filter(
          id => !selectedCartItemIds.includes(id)
        )
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