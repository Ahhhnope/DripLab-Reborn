import { useCartStore } from '../../stores/cart.js'
import { useAuthStore } from '../Authorization/Auth.js'
import api from '../../api/axios'
import MomoPopup from '../TheATMmomo/Momo.vue'

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
const ALL_WARDS = [
  'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Boong', 'Phường Hàng Bồ',
  'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã',
  'Phường Hàng Trống', 'Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam',
  'Phường Đồng Xuân', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân',
  'Phường Tràng Tiền', 'Phường Trần Hưng Đạo',
  'Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ',
  'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh',
  'Phường Nhúc Lệ', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công',
  'Phường Trúc Bạch', 'Phường Vĩnh Phúc',
  'Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng',
  'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng',
  'Phường Ngã Tư Sở', 'Phường Nguyễn Trãi', 'Phường Ô Chợ Dừa', 'Phường Phương Liên',
  'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang',
  'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự',
  'Phường Văn Chương', 'Phường Văn Miếu',
  'Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Bạch Mai', 'Phường Bùi Thị Xuân',
  'Phường Cầu Dền', 'Phường Đồng Nhân', 'Phường Đồng Tâm', 'Phường Lê Đại Hành',
  'Phường Minh Khai', 'Phường Ngô Thì Nhậm', 'Phường Nguyễn Du', 'Phường Phạm Đình Hổ',
  'Phường Phố Huế', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương',
  'Phường Thanh Nhàn', 'Phường Trương Định', 'Phường Tương Mai', 'Phường Vĩnh Tuy',
  'Phường Đại Kim', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt',
  'Phường Hoàng Văn Thụ', 'Phường Lĩnh Nam', 'Phường Mai Động', 'Phường Tân Mai',
  'Phường Thanh Trì', 'Phường Thịnh Liệt', 'Phường Trần Phú', 'Phường Vĩnh Hưng', 'Phường Yên Sở',
  'Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung',
  'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc',
  'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình',
  'Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô',
  'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hoà', 'Phường Yên Hoà',
  'Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An',
  'Phường Tứ Liên', 'Phường Thuỵ Khuê', 'Phường Xuân La', 'Phường Yên Phụ',
  'Phường Bồ Đề', 'Phường Cự Khối', 'Phường Đức Giang', 'Phường Gia Thuỵ',
  'Phường Giang Biên', 'Phường Long Biên', 'Phường Ngọc Lâm', 'Phường Ngọc Thuỵ',
  'Phường Phúc Đồng', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn',
  'Phường Thượng Thanh', 'Phường Việt Hưng',
  'Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đông Ngạc', 'Phường Đức Thắng',
  'Phường Liên Mạc', 'Phường Phú Diễn', 'Phường Phúc Diễn',
  'Phường Tây Tựu', 'Phường Thụy Phương', 'Phường Thượng Cát', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo',
  'Phường Cầu Diễn', 'Phường Đại Mỗ', 'Phường Mễ Trì', 'Phường Mỹ Đình 1',
  'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Phương Canh', 'Phường Tây Mỗ',
  'Phường Trung Văn', 'Phường Xuân Phương',
  'Phường Biên Giang', 'Phường Dương Nội', 'Phường Đồng Mai', 'Phường Hà Cầu',
  'Phường La Khê', 'Phường Mộ Lao', 'Phường Phú La',
  'Phường Phú Lãm', 'Phường Phú Lương', 'Phường Phúc La',
  'Phường Vạn Phúc', 'Phường Văn Quán', 'Phường Yên Nghĩa', 'Phường Yết Kiêu',
  'Xã Đông Anh', 'Xã Sóc Sơn', 'Xã Mê Linh', 'Xã Gia Lâm', 'Xã Thường Tín',
  'Xã Thanh Oai', 'Xã Chương Mỹ', 'Xã Quốc Oai', 'Xã Thạch Thất', 'Xã Phúc Thọ',
].sort((a, b) => a.localeCompare(b, 'vi'))

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
      computedDistanceKm: null,
      allWards: ALL_WARDS,
      wardSearch: '',

      distanceKm: null,
      distanceLoading: false,
      distanceTooFar: false,

      // Thông báo khoảng cách (lấy từ ChooseStore)
      showFarModal: false,
      showRejectModal: false,
      farDistanceThresholdKm: 5,
      rejectDistanceThresholdKm: 8,
      distanceSource: null, // 'saved' | 'new'
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
        baseName: item.base?.name|| null,
        basesPrice: item.base?.price || 0,
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

      // Nếu chưa tính được khoảng cách thì phí ship = 0 và không cho tiếp tục
      const km = this.computedDistanceKm !== null
        ? this.computedDistanceKm
        : parseFloat(sessionStorage.getItem('selectedStoreDistanceKm') || '')

      if (!Number.isFinite(km)) return 0
      return calcShippingFee(String(km))
    },

    grandTotal() {
      return Math.max(0, this.selectedSubtotal + this.shippingFee - this.couponDiscount)
    },


    computedFullAddress() {
      if (this.addressMode === 'saved' && this.savedAddress) return this.savedAddress
      const parts = [this.form.street, this.form.ward, 'Hà Nội'].filter(Boolean)
      return parts.join(', ')
    },

    canProceed() {
      // phải có kết quả khoảng cách hợp lệ trước khi tiếp tục
      return (
        this.distanceKm !== null &&
        this.distanceKm !== -1 &&
        !this.distanceLoading &&
        !this.distanceTooFar
      )
    },
  },

  watch: {
    addressMode() {
      // Đổi tab địa chỉ: reset kết quả khoảng cách để tránh hiển thị lẫn nhau
      this._resetDistanceState()
      if (this.errors?.distance) {
        this.errors = { ...this.errors }
        delete this.errors.distance
      }
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

    filteredWards() {
      if (!this.wardSearch) return this.allWards
      return this.allWards.filter(w =>
        w.toLowerCase().includes(this.wardSearch.toLowerCase())
      )
    },
    async useSavedAddress() {
      this.addressMode = 'saved'
      await this.calcDistance()
    },


    _canProceedLegacy() {
        return !this.distanceTooFar && this.distanceKm !== -1
    },

    validate() {
      const e = {}
      if (this.distanceTooFar) {
        e.distance = 'Hiện chưa thể giao hàng vì khoảng cách quá xa (> 8km)'
      }
      if (!this.form.name.trim()) e.name = 'Vui lòng nhập họ và tên'
      if (!this.form.phone || this.form.phone.length < 10) e.phone = 'Số điện thoại phải đủ 10 số'
      
      // Validate địa chỉ
      
      if (this.addressMode === 'saved') {
        if (!this.savedAddress) e.address = 'Vui lòng chọn địa chỉ giao hàng'
      } else {
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
        const [savedRes, onlineRes] = await Promise.all([
          api.get('/promo-codes/my-promos', {params: {userId}}),
          api.get('/promo-codes/online-offline')
        ]);

        const combined = [...savedRes.data.filter(p => !p.isUsed), ...onlineRes.data]

        this.savedPromo = combined.filter(p => p.status)
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
    onWardInput() {
      const match = this.allWards.find(w => w === this.wardSearch)
      this.form.ward = match || ''
      this._resetDistanceState()
    },
    onWardChange() {
      const match = this.allWards.find(w => w === this.wardSearch)
      this.form.ward = match || ''
      this._resetDistanceState()
    },

    onStreetInput() {
      this._resetDistanceState()
    },

    _resetDistanceState() {
      this.distanceKm = null
      this.distanceTooFar = false
      this.computedDistanceKm = null
      this.distanceSource = null
      sessionStorage.removeItem('selectedStoreDistanceKm')
    },

    async calcDistance() {
      this.distanceSource = this.addressMode
      if (this.addressMode === 'saved' && this.savedAddress) {
        const parts = this.savedAddress.split(',').map(s => s.trim())
        const hanoiIdx = parts.findIndex(p => p.toLowerCase().includes('hà nội'))
        let searchAddr, fallback
        if (hanoiIdx >= 2) {
          searchAddr = parts.slice(hanoiIdx - 2, hanoiIdx + 1).join(', ') + ', Việt Nam'
          fallback   = parts.slice(hanoiIdx - 1, hanoiIdx + 1).join(', ') + ', Việt Nam'
        } else {
          searchAddr = parts.slice(-2).join(', ') + ', Hà Nội, Việt Nam'
          fallback   = parts.slice(-1).join(', ') + ', Hà Nội, Việt Nam'
        }
        console.log('Tìm:', searchAddr, '| Fallback:', fallback)
        await this._fetchDistance(searchAddr, fallback)
        return
      }
      const ward = this.form.ward || this.wardSearch
      if (!ward) return
      await this._fetchDistance(`${ward}, Hà Nội, Việt Nam`)
    },

  async _fetchDistance(customerAddr, fallbackAddr = null) {
    this.distanceLoading = true
    this.distanceKm = null
    this.distanceTooFar = false
    try {
      const encode = s => encodeURIComponent(s)
      const shopAddr = '241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Việt Nam'

      const fetchCoord = async (addr) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encode(addr)}&format=json&limit=1&countrycodes=vn`
        const res = await fetch(url, { headers: { 'Accept-Language': 'vi', 'User-Agent': 'DripLabApp/1.0' } })
        const data = await res.json()
        return data[0] || null
      }

      const [shop, customer] = await Promise.all([
        fetchCoord(shopAddr),
        fetchCoord(customerAddr),
      ])

      // Nếu customer null và có fallback → thử lại với phường/xã đơn giản hơn
      let customerCoord = customer
      if (!customerCoord && fallbackAddr) {
        console.log('Thử fallback:', fallbackAddr)
        customerCoord = await fetchCoord(fallbackAddr)
      }

      if (!shop || !customerCoord) {
        this.distanceKm = -1; return
      }

      const toRad = d => d * Math.PI / 180
      const lat1 = +shop.lat, lon1 = +shop.lon
      const lat2 = +customerCoord.lat, lon2 = +customerCoord.lon
      const R = 6371
      const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
      this.distanceKm = +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
      this.distanceTooFar = this.distanceKm >= this.rejectDistanceThresholdKm
      this.computedDistanceKm = this.distanceTooFar ? null : this.distanceKm
      sessionStorage.setItem('selectedStoreDistanceKm', this.distanceTooFar ? '' : String(this.distanceKm))

      // Hiển thị thông báo ngay trên màn hình sau khi tính
      if (this.distanceKm >= this.rejectDistanceThresholdKm) {
        this.showRejectModal = true
      } else if (this.distanceKm >= this.farDistanceThresholdKm) {
        this.showFarModal = true
      }
    } catch (e) {
      console.error('Distance error:', e)
      this.distanceKm = -1
    } finally {
      this.distanceLoading = false
    }
  },

    closeFarModal() {
      this.showFarModal = false
    },

    confirmContinueOrder() {
      // chỉ đóng thông báo và cho phép user chọn thanh toán tiếp
      this.showFarModal = false
    },

    resetAddressForReinput() {
      // reset phường/xã + số nhà để người dùng nhập lại
      this.showFarModal = false
      this.wardSearch = ''
      this.form.ward = ''
      this.form.street = ''
      this._resetDistanceState()
    },

    closeRejectModal() {
      this.showRejectModal = false
    },

    ackReject() {
      this.showRejectModal = false
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

        const response = await api.post(
          `/carts/user/${this.authStore.user.id}/checkout-selected`,
          {
            cartItemIds: selectedCartItemIds,
            shippingFee: this.shippingFee,
            promoCode: this.couponCode,
            orderType: "Online order",
            note: this.form.note,
            paymentMethod: this.form.payment === 'COD' ? 'Tiền mặt' : 'MoMo',
            customerName: this.form.name,
            customerPhone: this.form.phone,
            deliveryAddress: this.computedFullAddress,
          }
        )
        this.lastOrderId = response.data.id || 'N/A'
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