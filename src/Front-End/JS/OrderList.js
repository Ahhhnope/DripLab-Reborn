import { computed, onMounted, ref } from "vue";
import api from "../../api/axios";

export function useOrderList() {
  const activeTab = ref("all");
  const filter = ref({
    keyword: "",
    status: "all",
    type: "all",
    fromDate: null,
    toDate: null,
  });

  const allItems = ref([])


  function mapStatus(s) {
    if (!s) return 'pending';
    const map = {
      'Chờ xác nhận':      'pending',
      'Đang xử lý':        'processing',
      'Đang vận chuyển':   'shipping',
      'Đã giao':           'delivered',
      'Đã huỷ':            'cancelled',
    };
    return map[s] ?? s.toLowerCase();
  }

  async function loadOrders() {
    try {
      const res = await api.get('/orders');
      allItems.value = res.data.map(o => ({
        id:           o.id,
        code:         String(o.orderNumber ?? o.id),
        shippingType: o.paymentMethod ?? 'COD',
        status:       mapStatus(o.status),
        qty:          (o.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 1), 0),
        pay:          o.finalPrice ?? 0,
        deadline:  o.orderDate ? new Date(o.orderDate).toLocaleString('vi-VN') : '-',
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '-',
        note:      o.note ?? '',
        customer: {
          id:      o.customer?.id       ?? null,
          name:    o.customer?.fullName ?? o.customer?.name ?? '-',  // ✅ try fullName first
          phone:   o.customer?.phone    ?? '-',
          address: o.shippingAddress    ?? '-',
        },
        // damn....
        itemsDetail: (o.items ?? []).map(i => ({
          id:      i.id,
          name:    i.drink?.name ?? '-',
          qty:     i.quantity    ?? 1,
          total:   (i.basePriceAtPurchase ?? 0) * (i.quantity ?? 1),
          options: [
            i.size?.name ? `Size ${i.size.name}` : null,
            ...(i.orderItemToppings ?? []).map(t => t.topping?.name).filter(Boolean),
          ].filter(Boolean),
        })),
        subtotal:    o.originalPrice  ?? 0,
        shippingFee: o.shippingFee    ?? 0,
        discount:    o.discountAmount ?? 0,
      }));

    } catch (e) {
      console.error('loadOrders error:', e.response?.status, e.response?.data);
    }
  }


  const items = computed(() => {
    const k = filter.value.keyword.trim().toLowerCase();
    return allItems.value.filter(x => {
      const okTab     = activeTab.value === "all" || x.status === activeTab.value;
      const okStatus  = filter.value.status === "all" || x.status === filter.value.status;
      const okKeyword = !k || String(x.code).toLowerCase().includes(k);
      return okTab && okStatus && okKeyword;
    });
  });

  function applyFilter(payload) {
    filter.value = payload;
  }

  onMounted(loadOrders);
  return { activeTab, filter, allItems, items, applyFilter, loadOrders, mapStatus };
}