// ============================================================
//  Cart.js – Logic chính của Giỏ Hàng
//  Dữ liệu mock nằm trực tiếp trong data() để test
//  Khi có backend: thay cartItems bằng kết quả gọi API
// ============================================================

// SDT
const TRANSFER_ACCOUNTS = {
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

  data() {
    return {
      // ── MOCK DATA – thay bằng API call khi có backend ──
      cartItems: [
        {
          id: 1,
          productId: 101,
          name: 'Cà Phê Trứng Hà Nội',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80',
          basePrice: 55000,
          quantity: 1,
          toppings: ['Trân châu', 'Thạch cafe'],
          sugar: '70%',
          ice: '50%',
        },
        {
          id: 2,
          productId: 102,
          name: 'Bạc Xỉu Sài Gòn',
          image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80',
          basePrice: 45000,
          quantity: 2,
          toppings: ['Sữa đặc thêm'],
          sugar: '100%',
          ice: '100%',
        },
        {
          id: 3,
          productId: 103,
          name: 'Cold Brew Chanh Leo',
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80',
          basePrice: 65000,
          quantity: 1,
          toppings: [],
          sugar: '50%',
          ice: 'Không đá',
        },
        {
          id: 4,
          productId: 104,
          name: 'Trà Sữa Matcha Đặc Biệt',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80',
          basePrice: 60000,
          quantity: 1,
          toppings: ['Trân châu đen', 'Pudding trứng'],
          sugar: '50%',
          ice: '70%',
        },
        {
          id: 5,
          productId: 105,
          name: 'Sinh Tố Bơ Sữa Tươi',
          image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=300&q=80',
          basePrice: 50000,
          quantity: 1,
          toppings: ['Sữa đặc'],
          sugar: '30%',
          ice: '50%',
        },
        {
          id: 6,
          productId: 106,
          name: 'Hồng Trà Vải Thiều',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80',
          basePrice: 42000,
          quantity: 3,
          toppings: ['Thạch dừa'],
          sugar: '70%',
          ice: '100%',
        },
        {
          id: 7,
          productId: 107,
          name: 'Cà Phê Muối Kem Béo',
          image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&q=80',
          basePrice: 58000,
          quantity: 1,
          toppings: ['Kem muối', 'Phô mai'],
          sugar: '0%',
          ice: 'Không đá',
        },
      ],

      // ── Trạng thái chọn ──
      selectedIds: [],

      // ── Confirm xóa ──
      deleteTarget: null,

      // ── Modal đặt hàng ──
      showOrderModal: false,

      // ── Mã giảm giá ──
      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      couponMessage: '',

      // ── Thanh toán ──
      paymentMethod: 'COD',

      // ── Chuyển khoản (giống MoMo CounterOrder) ──
      transferPhone: '',
      transferName: '',
      transferStep: 1,       // 1 = nhập SĐT, 2 = xác nhận
      transferError: '',
      transferLoading: false,

      // ── Trạng thái ──
      isPlacingOrder: false,

      // ── Kết quả đặt hàng ──
      showSuccessModal: false,
      lastOrderId: '',
    };
  },

  computed: {
    selectedItems() {
      return this.cartItems.filter(item => this.selectedIds.includes(item.id));
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    },
    shippingFee() {
      if (this.selectedItems.length === 0) return 0;
      return this.selectedSubtotal >= 100000 ? 0 : 20000;
    },
    selectedTotal() {
      return this.selectedSubtotal + this.shippingFee;
    },
    grandTotal() {
      return Math.max(0, this.selectedTotal - this.couponDiscount);
    },
    isAllSelected() {
      return this.cartItems.length > 0 && this.selectedIds.length === this.cartItems.length;
    },
    isSomeSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.cartItems.length;
    },
  },

  methods: {
    // ── Format ──
    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount);
    },

    // ── Selection ──
    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx === -1) this.selectedIds.push(id);
      else this.selectedIds.splice(idx, 1);
    },
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.cartItems.map(i => i.id) : [];
    },

    // ── Quantity ──
    increaseQty(item) {
      item.quantity++;
    },
    decreaseQty(item) {
      if (item.quantity <= 1) return;
      item.quantity--;
    },

    // ── Delete ──
    confirmDelete(item) { this.deleteTarget = item; },
    cancelDelete()      { this.deleteTarget = null; },
    executeDelete() {
      if (!this.deleteTarget) return;
      const id = this.deleteTarget.id;
      this.cartItems    = this.cartItems.filter(i => i.id !== id);
      this.selectedIds  = this.selectedIds.filter(s => s !== id);
      this.deleteTarget = null;
    },

    // ── Order modal ──
    openOrderModal()  {
      if (this.selectedItems.length) {
        this.resetTransfer();
        this.showOrderModal = true;
      }
    },
    closeOrderModal() { this.showOrderModal = false; },

    // ── Coupon (mock) ──
    applyCoupon() {
      if (!this.couponCode.trim()) return;
      const code = this.couponCode.toUpperCase();
      if (code === 'CAFE10') {
        this.couponDiscount = Math.round(this.selectedSubtotal * 0.1);
        this.couponApplied  = true;
        this.couponMessage  = `✓ Giảm 10% đơn hàng! (-${this.formatVND(this.couponDiscount)})`;
      } else if (code === 'FREESHIP') {
        this.couponDiscount = 20000;
        this.couponApplied  = true;
        this.couponMessage  = `✓ Miễn phí vận chuyển! (-${this.formatVND(20000)})`;
      } else {
        this.couponDiscount = 0;
        this.couponApplied  = false;
        this.couponMessage  = 'Mã giảm giá không hợp lệ.';
      }
    },
    removeCoupon() {
      this.couponCode     = '';
      this.couponApplied  = false;
      this.couponDiscount = 0;
      this.couponMessage  = '';
    },

    // ── Chuyển khoản – giống MoMo CounterOrder ──
    resetTransfer() {
      this.transferPhone   = '';
      this.transferName    = '';
      this.transferStep    = 1;
      this.transferError   = '';
      this.transferLoading = false;
    },

    onTransferPhoneInput(e) {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
      this.transferPhone   = clean;
      this.transferError   = '';
      this.transferName    = '';
      this.transferLoading = false;

      if (clean.length === 10) {
        this.transferLoading = true;
        setTimeout(() => {
          this.transferLoading = false;
          if (TRANSFER_ACCOUNTS[clean]) {
            this.transferName  = TRANSFER_ACCOUNTS[clean];
            this.transferError = '';
          } else {
            this.transferName  = '';
            this.transferError = 'Không tìm thấy tài khoản ngân hàng';
          }
        }, 900);
      }
    },

    confirmTransferReceiver() {
      if (!this.transferName) return;
      this.transferStep = 2;
    },

    backTransfer() {
      this.transferStep = 1;
    },

    // ── Place order (mock) ──
    placeOrder() {
      if (this.isPlacingOrder) return;
      // Nếu chọn chuyển khoản mà chưa xác nhận người nhận
      if (this.paymentMethod === 'TRANSFER' && this.transferStep < 2) return;
      this.isPlacingOrder = true;

      setTimeout(() => {
        this.lastOrderId      = 'ORD-' + Date.now();
        this.showOrderModal   = false;
        const orderedIds      = this.selectedItems.map(i => i.id);
        this.cartItems        = this.cartItems.filter(i => !orderedIds.includes(i.id));
        this.selectedIds      = [];
        this.removeCoupon();
        this.resetTransfer();
        this.showSuccessModal = true;
        this.isPlacingOrder   = false;
      }, 800);
    },

    closeSuccessModal() { this.showSuccessModal = false; },
  },
};