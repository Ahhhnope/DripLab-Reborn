// ============================================================
//  Cart.js – DripLab POS Logic (nah.....)
// ============================================================
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
    // Maps the SQL Server data structure to your UI cards
    cartItems() {
      return this.cartStore.items.map((item) => ({
        id: item.id, // cart_item_id
        productId: item.drinkId,
        name: item.drink?.name || 'Drink',
        image: item.drink?.imageUrl || '/placeholder.png',
        // Calculates total price per item including size/toppings
        basePrice:
          (item.drink?.basePrice || 0) +
          (item.size?.price || 0) +
          (item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0),
        quantity: item.quantity,
        sugar: item.sugar || '100%',
        ice: item.ice || '100%',
        toppings: item.toppings?.map((t) => t.topping?.name).filter(Boolean) || [],
      }))
    },

    selectedItems() {
      return this.cartItems.filter((i) => this.selectedIds.includes(i.id))
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
      return this.cartItems.length > 0 && this.selectedIds.length === this.cartItems.length
    },
    isSomeSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.cartItems.length
    },
  },

  async created() {
    const userId = this.authStore.user?.id
    if (userId) {
      await this.cartStore.fetchUserCart(userId)
      // Auto-select everything on load
      this.selectedIds = this.cartItems.map((i) => i.id)
    }
  },

  methods: {
    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount)
    },

    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id)
      idx === -1 ? this.selectedIds.push(id) : this.selectedIds.splice(idx, 1)
    },
    
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.cartItems.map((i) => i.id) : []
    },

    async increaseQty(item) {
      const storeItem = this.cartStore.items.find((i) => i.id === item.id)
      if (storeItem) {
        storeItem.quantity++
        // Sync with Backend
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: storeItem.quantity })
      }
    },

    async decreaseQty(item) {
      const storeItem = this.cartStore.items.find((i) => i.id === item.id)
      if (storeItem && storeItem.quantity > 1) {
        storeItem.quantity--
        // Sync with Backend
        await api.put(`/carts/items/${item.id}/quantity`, { quantity: storeItem.quantity })
      }
    },

    confirmDelete(item) { this.deleteTarget = item },
    cancelDelete() { this.deleteTarget = null },

    async executeDelete() {
      if (!this.deleteTarget) return
      const id = this.deleteTarget.id
      try {
        await api.delete(`/carts/items/${id}`)
        this.cartStore.items = this.cartStore.items.filter((i) => i.id !== id)
        this.selectedIds = this.selectedIds.filter((s) => s !== id)
        this.deleteTarget = null
      } catch (e) {
        alert("Lỗi khi xóa sản phẩm")
      }
    },

    openOrderModal() {
      if (!this.selectedItems.length) return
      this.paymentMethod = 'COD'
      this.resetMomo()
      this.showOrderModal = true
    },

    closeOrderModal() {
      this.showOrderModal = false
      this.paymentMethod = 'COD'
      this.resetMomo()
    },

    applyCoupon() {
      if (!this.couponCode.trim()) return
      const code = this.couponCode.toUpperCase()
      if (code === 'CAFE10') {
        this.couponDiscount = Math.round(this.selectedSubtotal * 0.1)
        this.couponApplied = true
        this.couponMessage = `✓ Giảm 10% đơn hàng! (-${this.formatVND(this.couponDiscount)})`
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

    openMomoFlow() {
      this.resetMomo()
      this.paymentMethod = 'MOMO'
    },

    backToPaymentSelect() {
      this.paymentMethod = 'COD'
      this.resetMomo()
    },

    resetMomo() {
      this.momoPhone = ''
      this.momoName = ''
      this.momoStep = 1
      this.momoError = ''
      this.momoLoading = false
    },

    onMomoPhoneInput(e) {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 10)
      this.momoPhone = clean
      this.momoError = ''
      this.momoName = ''
      this.momoLoading = false
      if (clean.length === 10) {
        this.momoLoading = true
        setTimeout(() => {
          this.momoLoading = false
          if (MOMO_ACCOUNTS[clean]) {
            this.momoName = MOMO_ACCOUNTS[clean]
            this.momoError = ''
          } else {
            this.momoName = ''
            this.momoError = 'Không tìm thấy tên tài khoản'
          }
        }, 900)
      }
    },

    confirmMomoReceiver() {
      if (!this.momoName) return
      this.momoStep = 2
    },

    async placeOrder() {
      this.isPlacingOrder = true;
      try {
        //Send the request to your OrderController
        // Use 'this' to access authStore and your component's data properties
        const response = await api.post(`/orders/checkout/${this.authStore.user.id}`, {
          note: this.couponApplied ? `Coupon: ${this.couponCode}` : "Online Order",
          paymentMethod: this.paymentMethod === 'COD' ? 'Tiền mặt' : 'MoMo'
        });

        //Capture the order number from the backend for the success screen
        this.lastOrderId = response.data.orderNumber; 
        
        //Switch modals
        this.showOrderModal = false;
        this.showSuccessModal = true;

        //Clear the local cart state since the backend has cleared the DB
        this.cartStore.items = []; 
        this.selectedIds = [];
        
      } catch (error) {
        console.error("Lỗi checkout:", error);
        const msg = error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại!";
        alert(msg);
      } finally {
        this.isPlacingOrder = false;
      }
    },

    closeSuccessModal() {
      this.showSuccessModal = false
      this.$router.push('/menu') // Go back to shop after success
    }
  }
}