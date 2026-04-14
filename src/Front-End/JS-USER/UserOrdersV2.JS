import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios' 

export function useUserOrders() {
  const router = useRouter()
  const currentRoute = '/account/orders'

  const navItems = [
    { id: 'account',  label: 'Tài Khoản',         icon: 'person',        route: '/account' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: 'lock',          route: '/account/password' },
    { id: 'address',  label: 'Địa Chỉ',           icon: 'location_on',   route: '/account/address' },
    { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'package',       route: '/account/orders' },
    { id: 'points',   label: 'Điểm của tôi',      icon: 'loyalty',       route: '/account/points' }
  ]

  const orderSteps = ref([
    { label: 'Chờ xác nhận',    icon: 'pending_actions',   status: 'pending'    },
    { label: 'Đang xử lý',      icon: 'settings',          status: 'processing' },
    { label: 'Đang vận chuyển', icon: 'local_shipping',    status: 'shipping'   },
    { label: 'Đã giao',         icon: 'home',              status: 'delivered'  },
    { label: 'Đã huỷ',          icon: 'cancel',            status: 'cancelled'  },
  ])

  const activeOrder = ref([])
  const allReceipts = ref([])
  const currentStatus = ref('')
  const shipping = ref({ name: '', phone: '', address: '' })
  const STATUS_ORDER = ['pending', 'processing', 'shipping', 'delivered']

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const allData = response.data;
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const email = currentUser?.email || 'a@gmail.com';

      // 1. ACTIVE ORDERS MAPPING
      activeOrder.value = allData
        .filter(o => o.customer?.email === email && !['delivered', 'cancelled'].includes(o.status?.toLowerCase()))
        .map(o => ({
          id: o.id,
          name: `#DL-${o.orderNumber || o.id}`,
          price: new Intl.NumberFormat('vi-VN').format(o.finalPrice) + ' VNĐ',
          receiptData: {
            id: `#DL-${o.orderNumber || o.id}`,
            date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
            total: new Intl.NumberFormat('vi-VN').format(o.finalPrice) + ' VNĐ',
            subtotal: new Intl.NumberFormat('vi-VN').format(o.finalPrice * 0.95) + ' VNĐ',
            tax: new Intl.NumberFormat('vi-VN').format(o.finalPrice * 0.05) + ' VNĐ',
            items: (o.items || []).map(i => ({
              name: i.drink?.name || 'Sản phẩm',
              qty: i.quantity,
              price: new Intl.NumberFormat('vi-VN').format(i.basePriceAtPurchase) + ' VNĐ',
              sugar: i.sugarLevel || 100,
              ice: i.iceLevel || 100,
              img: i.drink?.imagePath || '/default.png'
            }))
          }
        }));

      if (activeOrder.value.length > 0) {
        currentStatus.value = allData.find(o => o.id === activeOrder.value[0].id)?.status?.toLowerCase() || 'pending';
      }

      // 2. HISTORY (RECEIPTS) MAPPING
      allReceipts.value = allData
        .filter(o => o.customer?.email === email && ['delivered', 'cancelled'].includes(o.status?.toLowerCase()))
        .map(o => ({
          id: `#DL-${o.orderNumber || o.id}`,
          category: 'Online Order',
          date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
          total: new Intl.NumberFormat('vi-VN').format(o.finalPrice) + ' VNĐ',
          items: (o.items || []).map(i => ({
             name: i.drink?.name,
             qty: i.quantity,
             price: new Intl.NumberFormat('vi-VN').format(i.basePriceAtPurchase) + ' VNĐ',
             img: i.drink?.imagePath
          }))
        }));
    } catch (e) { console.error(e); }
  };

  onMounted(fetchOrders);

  // Stepper Logic
  const currentStepIndex = computed(() => STATUS_ORDER.indexOf(currentStatus.value));
  const stepsWithState = computed(() => {
    if (currentStatus.value === 'cancelled') {
      return orderSteps.value.map(s => s.status === 'cancelled' ? { ...s, state: 'active' } : { ...s, state: 'cancelled-grey' });
    }
    const idx = currentStepIndex.value;
    return orderSteps.value.filter(s => s.status !== 'cancelled').map((s, i) => ({
      ...s, state: i < idx ? 'done' : i === idx ? 'active' : 'pending'
    }));
  });

  const progressWidth = computed(() => {
    if (currentStatus.value === 'cancelled') return '0%';
    const idx = currentStepIndex.value;
    return `${(idx / (STATUS_ORDER.length - 1)) * 100}%`;
  });

  const showModal = ref(false);
  const selectedReceipt = ref(null);
  const visibleCount = ref(3);

  const receipts = computed(() => allReceipts.value.slice(0, visibleCount.value));
  const hasMore = computed(() => visibleCount.value < allReceipts.value.length);

  function openModal(data) { selectedReceipt.value = data; showModal.value = true; }
  function closeModal() { showModal.value = false; }
  function goTo(route) { router.push(route); }

  return {
    navItems, currentRoute, orderSteps: stepsWithState, progressWidth,
    activeOrder, receipts, hasMore, showModal, selectedReceipt, openModal, closeModal, goTo,
    loadMore: () => { visibleCount.value += 3 },
    applyFilter: () => { /* Add logic if needed */ },
    resetFilter: () => { /* Add logic if needed */ }
  }
}