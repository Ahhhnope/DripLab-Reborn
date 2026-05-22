import { useCartStore } from '../../stores/cart.js'
import { useAuthStore } from '../Authorization/Auth.js'
import api from '../../api/axios'
import MomoPopup from '../QRMoMo/Momo.vue'

function getImageUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://localhost:8080${url}`
}

function calcShippingFee(distanceKmStr) {
  if (distanceKmStr === '' || distanceKmStr === null || distanceKmStr === undefined) return 25000
  const km = parseFloat(distanceKmStr)
  if (isNaN(km)) return 25000
  if (km <= 1) return 0
  const extraKm = Math.ceil(km - 1)
  const cappedKm = Math.min(extraKm, 7)
  return cappedKm * 5000
}

// ── Dữ liệu quận/phường Hà Nội ──────────────────────────────────────────────
const HANOI_DISTRICTS = [
  {
    name: 'Quận Ba Đình',
    wards: ['Phường Cống Vị','Phường Điện Biên','Phường Đội Cấn','Phường Giảng Võ',
      'Phường Kim Mã','Phường Liễu Giai','Phường Ngọc Hà','Phường Ngọc Khánh',
      'Phường Nguyễn Trung Trực','Phường Phúc Xá','Phường Quán Thánh','Phường Thành Công',
      'Phường Trúc Bạch','Phường Vĩnh Phúc'],
  },
  {
    name: 'Quận Hoàn Kiếm',
    wards: ['Phường Chương Dương','Phường Cửa Đông','Phường Cửa Nam','Phường Đồng Xuân',
      'Phường Hàng Bạc','Phường Hàng Bài','Phường Hàng Bồ','Phường Hàng Buồm',
      'Phường Hàng Đào','Phường Hàng Gai','Phường Hàng Mã','Phường Hàng Trống',
      'Phường Lý Thái Tổ','Phường Phan Chu Trinh','Phường Phúc Tân','Phường Tràng Tiền',
      'Phường Trần Hưng Đạo','Phường Đình Công'],
  },
  {
    name: 'Quận Đống Đa',
    wards: ['Phường Cát Linh','Phường Hàng Bột','Phường Khâm Thiên','Phường Kim Liên',
      'Phường Láng Hạ','Phường Láng Thượng','Phường Nam Đồng','Phường Ngã Tư Sở',
      'Phường Ô Chợ Dừa','Phường Phương Liên','Phường Phương Mai','Phường Quang Trung',
      'Phường Quốc Tử Giám','Phường Thịnh Quang','Phường Thổ Quan','Phường Trung Liệt',
      'Phường Trung Phụng','Phường Trung Tự','Phường Văn Chương','Phường Văn Miếu',
      'Phường Xã Đàn'],
  },
  {
    name: 'Quận Hai Bà Trưng',
    wards: ['Phường Bách Khoa','Phường Bạch Đằng','Phường Bạch Mai','Phường Bùi Thị Xuân',
      'Phường Cầu Dền','Phường Đồng Nhân','Phường Đồng Tâm','Phường Lê Đại Hành',
      'Phường Minh Khai','Phường Ngô Thì Nhậm','Phường Nguyễn Du','Phường Phạm Đình Hổ',
      'Phường Phố Huế','Phường Quỳnh Lôi','Phường Quỳnh Mai','Phường Thanh Lương',
      'Phường Thanh Nhàn','Phường Trương Định','Phường Vĩnh Tuy'],
  },
  {
    name: 'Quận Hoàng Mai',
    wards: ['Phường Đại Kim','Phường Định Công','Phường Giáp Bát','Phường Hoàng Liệt',
      'Phường Hoàng Văn Thụ','Phường Lĩnh Nam','Phường Mai Động','Phường Tân Mai',
      'Phường Thịnh Liệt','Phường Thanh Trì','Phường Tương Mai','Phường Trần Phú',
      'Phường Vĩnh Hưng','Phường Yên Sở'],
  },
  {
    name: 'Quận Thanh Xuân',
    wards: ['Phường Hạ Đình','Phường Khương Đình','Phường Khương Mai','Phường Khương Trung',
      'Phường Kim Giang','Phường Nhân Chính','Phường Phương Liệt','Phường Thanh Xuân Bắc',
      'Phường Thanh Xuân Nam','Phường Thanh Xuân Trung'],
  },
  {
    name: 'Quận Cầu Giấy',
    wards: ['Phường Dịch Vọng','Phường Dịch Vọng Hậu','Phường Mai Dịch','Phường Nghĩa Đô',
      'Phường Nghĩa Tân','Phường Quan Hoa','Phường Trung Hòa','Phường Yên Hòa'],
  },
  {
    name: 'Quận Tây Hồ',
    wards: ['Phường Bưởi','Phường Nhật Tân','Phường Phú Thượng','Phường Quảng An',
      'Phường Tứ Liên','Phường Thụy Khuê','Phường Xuân La','Phường Yên Phụ'],
  },
  {
    name: 'Quận Long Biên',
    wards: ['Phường Bồ Đề','Phường Cự Khối','Phường Đức Giang','Phường Gia Thụy',
      'Phường Giang Biên','Phường Long Biên','Phường Ngọc Lâm','Phường Ngọc Thụy',
      'Phường Phúc Đồng','Phường Phúc Lợi','Phường Sài Đồng','Phường Thạch Bàn',
      'Phường Thượng Thanh','Phường Việt Hưng'],
  },
  {
    name: 'Quận Nam Từ Liêm',
    wards: ['Phường Cầu Diễn','Phường Đại Mỗ','Phường Mễ Trì','Phường Mỹ Đình 1',
      'Phường Mỹ Đình 2','Phường Phú Đô','Phường Phương Canh','Phường Tây Mỗ',
      'Phường Trung Văn','Phường Xuân Phương'],
  },
  {
    name: 'Quận Bắc Từ Liêm',
    wards: ['Phường Cổ Nhuế 1','Phường Cổ Nhuế 2','Phường Đông Ngạc','Phường Đức Thắng',
      'Phường Liên Mạc','Phường Minh Khai','Phường Phú Diễn','Phường Phúc Diễn',
      'Phường Tây Tựu','Phường Thượng Cát','Phường Thụy Phương','Phường Xuân Đỉnh',
      'Phường Xuân Tảo'],
  },
  {
    name: 'Quận Hà Đông',
    wards: ['Phường Biên Giang','Phường Đồng Mai','Phường Dương Nội','Phường Hà Cầu',
      'Phường Kiến Hưng','Phường La Khê','Phường Mộ Lao','Phường Nguyễn Trãi',
      'Phường Phú La','Phường Phú Lãm','Phường Phú Lương','Phường Phúc La',
      'Phường Quang Trung','Phường Vạn Phúc','Phường Văn Quán','Phường Yên Nghĩa',
      'Phường Yết Kiêu'],
  },
  {
    name: 'Huyện Đông Anh',
    wards: ['Thị trấn Đông Anh','Xã Bắc Hồng','Xã Cổ Loa','Xã Đại Mạch','Xã Đông Hội',
      'Xã Dục Tú','Xã Hải Bối','Xã Kim Chung','Xã Kim Nỗ','Xã Liên Hà',
      'Xã Mai Lâm','Xã Nam Hồng','Xã Nguyên Khê','Xã Tàm Xá','Xã Thụy Lâm',
      'Xã Tiên Dương','Xã Uy Nỗ','Xã Vân Hà','Xã Vân Nội','Xã Việt Hùng',
      'Xã Vĩnh Ngọc','Xã Xuân Canh','Xã Xuân Nộn','Xã Võng La'],
  },
  {
    name: 'Huyện Gia Lâm',
    wards: ['Thị trấn Trâu Quỳ','Thị trấn Yên Viên','Xã Bát Tràng','Xã Cổ Bi',
      'Xã Dương Hà','Xã Dương Quang','Xã Dương Xá','Xã Đa Tốn','Xã Đặng Xá',
      'Xã Đình Xuyên','Xã Đông Dư','Xã Kiêu Kỵ','Xã Kim Lan','Xã Kim Sơn',
      'Xã Lệ Chi','Xã Ninh Hiệp','Xã Phú Thị','Xã Phụng Công','Xã Trung Mầu',
      'Xã Văn Đức','Xã Yên Thường','Xã Yên Viên'],
  },
  {
    name: 'Huyện Thanh Trì',
    wards: ['Thị trấn Văn Điển','Xã Duyên Hà','Xã Đại Áng','Xã Đông Mỹ','Xã Hữu Hòa',
      'Xã Liên Ninh','Xã Ngũ Hiệp','Xã Ngọc Hồi','Xã Tả Thanh Oai','Xã Tam Hiệp',
      'Xã Tân Triều','Xã Thanh Liệt','Xã Tứ Hiệp','Xã Vĩnh Quỳnh','Xã Yên Mỹ'],
  },
  {
    name: 'Huyện Hoài Đức',
    wards: ['Thị trấn Trạm Trôi','Xã An Khánh','Xã An Thượng','Xã Cát Quế','Xã Di Trạch',
      'Xã Đắc Sở','Xã Đông La','Xã Dương Liễu','Xã Lại Yên','Xã La Phù',
      'Xã Minh Khai','Xã Song Phương','Xã Sơn Đồng','Xã Tiền Yên','Xã Vân Canh',
      'Xã Vân Côn','Xã Yên Sở'],
  },
  {
    name: 'Huyện Mê Linh',
    wards: ['Thị trấn Chi Đông','Thị trấn Quang Minh','Xã Chu Phan','Xã Đại Thịnh',
      'Xã Hoàng Kim','Xã Kim Hoa','Xã Liên Mạc','Xã Mê Linh','Xã Tam Đồng',
      'Xã Thanh Lâm','Xã Tráng Việt','Xã Tiến Thắng','Xã Tiến Thịnh','Xã Tự Lập',
      'Xã Văn Khê','Xã Vạn Yên'],
  },
  {
    name: 'Huyện Thường Tín',
    wards: ['Thị trấn Thường Tín','Xã Chương Dương','Xã Dũng Tiến','Xã Duyên Thái',
      'Xã Hà Hồi','Xã Hiền Giang','Xã Hòa Bình','Xã Khánh Hà','Xã Lê Lợi',
      'Xã Liên Phương','Xã Minh Cường','Xã Nghiêm Xuyên','Xã Nguyễn Trãi',
      'Xã Nhị Khê','Xã Ninh Sở','Xã Quất Động','Xã Tân Minh','Xã Thắng Lợi',
      'Xã Thống Nhất','Xã Thư Phú','Xã Tiền Phong','Xã Tô Hiệu','Xã Tự Nhiên',
      'Xã Văn Bình','Xã Văn Phú','Xã Văn Tự','Xã Vạn Điểm','Xã Vân Tảo'],
  },
]

export default {
  name: 'CheckoutApp',
  components: { MomoPopup },

  setup() {
    const cartStore = useCartStore()
    const authStore = useAuthStore()
    return { cartStore, authStore }
  },

  data() {
    return {
      currentStep: 1,
      selectedIds: [],

      form: {
        name: '',
        phone: '',
        district: '',
        ward: '',
        street: '',
        note: '',
        payment: 'COD',
      },
      errors: {},

      addressMode: 'saved', // 'saved' | 'new'
      savedAddress: '',

      gpsText: sessionStorage.getItem('userLocationText') || '',

      // Coupon
      savedPromo: [],
      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      couponMessage: '',

      // Order
      isPlacingOrder: false,
      showSuccessModal: false,
      lastOrderId: '',

      showMomoQR: false,

      hanoiDistricts: HANOI_DISTRICTS,
    }
  },

  computed: {
    cartItems() {
      return this.cartStore.items.map((item) => ({
        id: item.id,
        productId: item.drinkId,
        name: item.drink?.name || 'Drink',
        image: item.isCustom ? getImageUrl(item.imageUrl) : (getImageUrl(item.drink?.imageUrl) || '/placeholder.png'),
        drinkBasePrice: item.drink?.basePrice || 0,
        sizePrice: item.size?.price || 0,
        sizeName: item.size?.name || '',
        toppingPrice: item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0,
        toppingDetails: item.toppings?.map((t) => ({
          name: t.topping?.name || '',
          price: t.topping?.price || 0,
        })).filter(t => t.name) || [],
        basePrice:
          (item.drink?.basePrice || 0) +
          (item.size?.price || 0) +
          (item.toppings?.reduce((sum, t) => sum + (t.topping?.price || 0), 0) || 0) +
          (item.isCustom ? (item.base?.price|| 0) : 0) +
          (item.isCustom ? (item.coffeeBean?.price || 0) : 0) +
          (item.isCustom ? (item.milk?.price || 0) : 0),
        quantity: item.quantity,
        sugar: item.sugar || '100',
        ice: item.ice || '100',
        toppings: item.toppings?.map((t) => t.topping?.name).filter(Boolean) || [],

        isCustom: item.isCustom || false,
        baseName: item.base.name|| null,
        basesPrice: item.base.price || 0,
        beanName: item.coffeeBean?.name || null,
        beanPrice: item.coffeeBean?.price || 0,
        milkName: item.milk?.name || null,
        milkPrice: item.milk?.price || 0
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
      return calcShippingFee(sessionStorage.getItem('selectedStoreDistanceKm'))
    },

    grandTotal() {
      return Math.max(0, this.selectedSubtotal + this.shippingFee - this.couponDiscount)
    },

    currentWards() {
      const d = this.hanoiDistricts.find(d => d.name === this.form.district)
      return d ? d.wards : []
    },

    computedFullAddress() {
      if (this.addressMode === 'saved' && this.savedAddress) return this.savedAddress
      const parts = [this.form.street, this.form.ward, this.form.district, 'Hà Nội'].filter(Boolean)
      return parts.join(', ')
    },
  },

  async created() {
    // Lấy selectedIds từ sessionStorage (do Cart.vue lưu lại)
    const raw = sessionStorage.getItem('checkoutSelectedIds')
    if (raw) {
      try { this.selectedIds = JSON.parse(raw) } catch { this.selectedIds = [] }
    }

    const userId = this.authStore.user?.id
    if (userId) {
      await this.cartStore.fetchUserCart(userId)

      // Nếu không có selectedIds từ session thì chọn tất cả
      if (!this.selectedIds.length) {
        this.selectedIds = this.cartItems.map(i => i.id)
      }

      // Điền thông tin user
      const user = this.authStore.user
      this.form.name = user.fullName || user.full_name || ''
      this.form.phone = user.phone || ''
      this.savedAddress = user.defaultAddress || user.default_address || ''
      if (!this.savedAddress) this.addressMode = 'new'

      await this.loadSavedCoupon(userId)
    }
  },

  methods: {
    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND', maximumFractionDigits: 0,
      }).format(amount)
    },

    onPhoneInput(e) {
      this.form.phone = e.target.value.replace(/\D/g, '').slice(0, 10)
      e.target.value = this.form.phone
    },

    onDistrictChange() {
      this.form.ward = ''
    },

    useSavedAddress() {
      // Đã dùng savedAddress – không cần làm gì thêm
    },

    useGpsAddress() {
      if (this.gpsText) {
        this.form.street = this.gpsText
        this.addressMode = 'new'
      }
    },

    validate() {
      const e = {}
      if (!this.form.name.trim()) e.name = 'Vui lòng nhập họ và tên'
      if (!this.form.phone || this.form.phone.length < 10) e.phone = 'Số điện thoại phải đủ 10 số'

      // Validate địa chỉ
      if (this.addressMode === 'saved') {
        if (!this.savedAddress) e.address = 'Vui lòng chọn địa chỉ giao hàng'
      } else {
        if (!this.form.district) e.district = 'Vui lòng chọn quận/huyện'
        if (!this.form.ward) e.ward = 'Vui lòng chọn phường/xã'
        if (!this.form.street.trim()) e.street = 'Vui lòng nhập số nhà, tên đường'
      }

      this.errors = e
      return Object.keys(e).length === 0
    },

    goToStep2() {
      if (!this.validate()) return
      this.currentStep = 2
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    async loadSavedCoupon(userId) {
      try {
        const res = await api.get('/promo-codes/my-promos', { params: { userId } })
        this.savedPromo = res.data.filter(p => p.status)
      } catch (e) {
        console.log('Error fetching promos:', e)
      }
    },

    async applyCoupon() {
      if (!this.couponCode) return
      try {
        const res = await api.post('/promo-codes/check', {
          userId: this.authStore.user.id,
          code: this.couponCode,
          orderTotal: this.selectedSubtotal,
        })
        this.couponDiscount = res.data.discount
        this.couponApplied = true
        this.couponMessage = `✓ Áp dụng thành công! (-${this.formatVND(res.data.discount)})`
      } catch (e) {
        this.couponDiscount = 0
        this.couponApplied = false
        this.couponMessage = e.response?.data?.message || 'Mã không hợp lệ'
      }
    },

    removeCoupon() {
      this.couponCode = ''
      this.couponApplied = false
      this.couponDiscount = 0
      this.couponMessage = ''
    },

    openMomoFlow() {
      this.showMomoQR = true
    },
    closeMomoQR() {
      this.showMomoQR = false
    },
    async onMomoPaid() {
      this.showMomoQR = false
      this.form.payment = 'MOMO'
      await this.placeOrder()
    },

    async placeOrder() {
      if (this.form.payment === 'MOMO' && !this.showMomoQR) {
        this.openMomoFlow()
        return
      }

      this.isPlacingOrder = true
      try {
        const selectedCartItemIds = this.selectedItems.map(i => i.id)
        const noteStr = [
          'Online Order',
          this.form.note ? `Note: "${this.form.note}"` : null,
          this.couponApplied ? `Coupon: ${this.couponCode}` : null,
        ].filter(Boolean).join(' - ')

        const response = await api.post(
          `/carts/user/${this.authStore.user.id}/checkout-selected`,
          {
            cartItemIds: selectedCartItemIds,
            shippingFee: this.shippingFee,
            promoCode: this.couponCode,
            note: noteStr,
            paymentMethod: this.form.payment === 'COD' ? 'Tiền mặt' : 'MoMo',
            customerName: this.form.name,
            customerPhone: this.form.phone,
            deliveryAddress: this.computedFullAddress,
          }
        )
        this.lastOrderId = response.data.orderNumber || response.data.id || 'N/A'
        this.showSuccessModal = true

        // Xóa khỏi cart store
        this.cartStore.items = this.cartStore.items.filter(
          i => !selectedCartItemIds.includes(i.id)
        )
        sessionStorage.removeItem('checkoutSelectedIds')
        this.removeCoupon()
      } catch (error) {
        console.error('Lỗi checkout:', error)
        alert(error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại!')
      } finally {
        this.isPlacingOrder = false
      }
    },

    closeSuccess() {
      this.showSuccessModal = false
      this.$router.push('/menu')
    },
  },
}