import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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

  const allItems = ref([]);

  function mapStatus(s) {
    if (!s) return "pending";
    const map = {
      "Chờ xác nhận": "pending",
      "Đang xử lý": "processing",
      "Đang vận chuyển": "shipping",
      "Đã giao": "delivered",
      "Đã huỷ": "cancelled",
      "Giao hàng không thành công": "delivery_failed",
    };
    return map[s] ?? String(s).toLowerCase();
  }

  async function loadOrders() {
    try {
      const res = await api.get("/orders");
      allItems.value = res.data.map((o) => {
        const orderDateMs = o.orderDate ? Date.parse(o.orderDate) : 0;
        const createdAtMs = o.createdAt ? Date.parse(o.createdAt) : 0;
        const sortTs = orderDateMs || createdAtMs || 0;

        return {
          id: o.id,
          code: String(o.orderNumber ?? o.id),
          shippingType: o.paymentMethod ?? "COD",
          status: mapStatus(o.status),
          qty: (o.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 1), 0),
          pay: o.finalPrice ?? 0,

          // hiển thị
          deadline: o.orderDate ? new Date(o.orderDate).toLocaleString("vi-VN") : "-",
          createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : "-",

          // dùng để sắp xếp đơn mới lên đầu
          sortTs,

          note: o.note ?? "",
          user: {
            id: o.user?.id ?? null,
            fullName: o.user?.fullName ? o.user.fullName : "-",
            email: o.user?.email ? o.user.email : "-",
            phone: o.user?.phone ?? "-",
            address: o.shippingAddress ?? "-",
          },

          itemsDetail: (o.items ?? []).map((i) => ({
            id: i.id,
            name: i.drink?.name ?? "-",
            qty: i.quantity ?? 1,
            total: (i.basePriceAtPurchase ?? 0) * (i.quantity ?? 1),
            options: [
              i.size?.name ? `Size ${i.size.name}` : null,
              ...(i.orderItemToppings ?? []).map((t) => t.topping?.name).filter(Boolean),
            ].filter(Boolean),
          })),

          subtotal: o.originalPrice ?? 0,
          shippingFee: o.shippingFee ?? 0,
          discount: o.discountAmount ?? 0,
        };
      });
    } catch (e) {
      console.error("loadOrders error:", e.response?.status, e.response?.data);
    }
  }

  // ───────────────── Filter + Sort (đơn mới lên đầu) ─────────────────
  const items = computed(() => {
    const k = filter.value.keyword.trim().toLowerCase();

    const filtered = allItems.value.filter((x) => {
      const okTab = activeTab.value === "all" || x.status === activeTab.value;
      const okStatus = filter.value.status === "all" || x.status === filter.value.status;
      const okKeyword = !k || String(x.code).toLowerCase().includes(k);
      return okTab && okStatus && okKeyword;
    });

    // sort đơn mới nhất lên đầu
    return filtered.sort((a, b) => (b.sortTs ?? 0) - (a.sortTs ?? 0) || (Number(b.id) - Number(a.id)));
  });

  // ───────────────── Pagination ─────────────────
  const page = ref(1);
  const pageSize = ref(10);

  const totalItems = computed(() => items.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)));

  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return items.value.slice(start, start + pageSize.value);
  });

  const startItem = computed(() => (totalItems.value ? (page.value - 1) * pageSize.value + 1 : 0));
  const endItem = computed(() => Math.min(page.value * pageSize.value, totalItems.value));

  watch([items, pageSize], () => {
    page.value = 1;
  });

  watch(totalPages, () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  });

  function applyFilter(payload) {
    filter.value = payload;
  }

  let intervalId = null;

  onMounted(() => {
    loadOrders();
    intervalId = setInterval(() => {
      loadOrders();
      console.log("Order list updated");
    }, 5000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    activeTab,
    filter,
    allItems,
    items,
    applyFilter,
    loadOrders,
    mapStatus,

    // pagination exports
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    startItem,
    endItem,
  };
}
