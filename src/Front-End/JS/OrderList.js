import { computed, ref } from "vue";

export function useOrderList() {
  const activeTab = ref("all");
  const filter = ref({
    keyword: "",
    status: "all",
    type: "all",
    fromDate: null,
    toDate: null,
  });

  const allItems = ref([
    {
      id: 1,
      code: "719523346",
      shippingType: "Chờ xác nhận",
      status: "pending",
      qty: 1,
      pay: 55000,
      deadline: "Hôm nay 09:28:00",

      // CHI TIẾT MẪU
      customer: { name: "Nguyễn Văn A", phone: "0909xxxxxx" },
      createdAt: "Hôm nay 13:36",
      itemsDetail: [
        {
          id: "p1",
          name: "Matcha Tea",
          qty: 1,
          total: 55000,
          options: ["1x Topping 1", "2x Topping 2", "1x Size L"],
        },
      ],
      subtotal: 55000,
      discount: 0,
    },

    {
      id: 2,
      code: "750602738",
      shippingType: "Đang xử lý",
      status: "processing",
      qty: 5,
      pay: 218000,
      deadline: "06/03/2026 14:05:07",

      // CHI TIẾT MẪU
      customer: { name: "Trần Thị B", phone: "0912xxxxxx" },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Cà phê sữa", qty: 2, total: 98000, options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Trà đào", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 267626,
      discount: 49626,
    },
    {
      id: 3,
      code: "751602731",
      shippingType: "Đang vận chuyển",
      status: "shipping",
      qty: 5,
      pay: 200000,
      deadline: "08/03/2026 14:05:07",

      // CHI TIẾT MẪU
      customer: { name: "Trần Văn E", phone: "0912xxxxxx" },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka", qty: 2, total: 98000, options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 218000,
      discount: 18000,
    },
    {
      id: 4,
      code: "771602731",
      shippingType: "Đã giao",
      status: "delivered",
      qty: 5,
      pay: 218000,
      deadline: "08/03/2026 14:05:07",

      // CHI TIẾT MẪU
      customer: { name: "Trần Văn E", phone: "0912xxxxxx" },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka", qty: 2, total: 98000, options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 300000,
      discount: 82000,
    },
    {
      id: 5,
      code: "781602731",
      shippingType: "Đã huỷ",
      status: "cancelled",
      qty: 5,
      pay: 220000,
      deadline: "08/03/2026 14:05:07",

      // CHI TIẾT MẪU
      customer: { name: "Trần Văn Nam", phone: "0912xxxxxx" },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka", qty: 2, total: 100000, options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 300000,
      discount: 80000,
    },
  ]);

  const items = computed(() => {
    const k = filter.value.keyword.trim().toLowerCase();
    const status = filter.value.status;

    return allItems.value.filter((x) => {
      const okTab = activeTab.value === "all" ? true : x.status === activeTab.value;
      const okStatus = status === "all" ? true : x.status === status;
      const okKeyword = !k ? true : String(x.code).toLowerCase().includes(k);
      return okTab && okStatus && okKeyword;
    });
  });

  function applyFilter(payload) {
    filter.value = payload;
  }

  return { activeTab, filter, allItems, items, applyFilter };
}
