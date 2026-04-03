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
      shippingType: "COD",
      status: "pending",
      qty: 1,
      pay: 55000,
      deadline: "Hôm nay 09:28:00",
      customer: {
        name: "Nguyễn Văn A",
        phone: "0909123456",
        address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
        note: "Giao trước 12h, gọi điện trước khi đến",
      },
      createdAt: "Hôm nay 13:36",
      itemsDetail: [
        { id: "p1", name: "Matcha Tea", qty: 1, total: 55000, options: ["1x Topping 1", "2x Topping 2", "1x Size L"] },
      ],
      subtotal: 55000,
      shippingFee: 0,
      discount: 0,
    },
    {
      id: 2,
      code: "750602738",
      shippingType: "Chuyển khoản",
      status: "processing",
      qty: 5,
      pay: 218000,
      deadline: "06/03/2026 14:05:07",
      customer: {
        name: "Trần Thị B",
        phone: "0912345678",
        address: "456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM",
        note: "",
      },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Cà phê sữa", qty: 2, total: 98000,  options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Trà đào",    qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 267626,
      shippingFee: 15000,
      discount: 49626,
    },
    {
      id: 3,
      code: "751602731",
      shippingType: "Ví điện tử",
      status: "shipping",
      qty: 5,
      pay: 200000,
      deadline: "08/03/2026 14:05:07",
      customer: {
        name: "Trần Văn E",
        phone: "0912987654",
        address: "789 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM",
        note: "Để đồ trước cửa",
      },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka",    qty: 2, total: 98000,  options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 218000,
      shippingFee: 0,
      discount: 18000,
    },
    {
      id: 4,
      code: "771602731",
      shippingType: "Thẻ tín dụng",
      status: "delivered",
      qty: 5,
      pay: 218000,
      deadline: "08/03/2026 14:05:07",
      customer: {
        name: "Lê Thị C",
        phone: "0938111222",
        address: "12 Võ Văn Tần, Phường 6, Quận 3, TP.HCM",
        note: "",
      },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka",    qty: 2, total: 98000,  options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 300000,
      shippingFee: 0,
      discount: 82000,
    },
    {
      id: 5,
      code: "781602731",
      shippingType: "COD",
      status: "cancelled",
      qty: 5,
      pay: 220000,
      deadline: "08/03/2026 14:05:07",
      customer: {
        name: "Trần Văn Nam",
        phone: "0977333444",
        address: "99 Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, TP.HCM",
        note: "",
      },
      createdAt: "06/03/2026 13:10",
      itemsDetail: [
        { id: "p2", name: "Moka",    qty: 2, total: 100000, options: ["Ít đá", "Thêm sữa"] },
        { id: "p3", name: "Hojicha", qty: 3, total: 120000, options: ["Size L"] },
      ],
      subtotal: 300000,
      shippingFee: 0,
      discount: 80000,
    },
  ]);

  const items = computed(() => {
    const k      = filter.value.keyword.trim().toLowerCase();
    const status = filter.value.status;
    return allItems.value.filter((x) => {
      const okTab     = activeTab.value === "all" ? true : x.status === activeTab.value;
      const okStatus  = status === "all"          ? true : x.status === status;
      const okKeyword = !k                        ? true : String(x.code).toLowerCase().includes(k);
      return okTab && okStatus && okKeyword;
    });
  });

  function applyFilter(payload) {
    filter.value = payload;
  }

  return { activeTab, filter, allItems, items, applyFilter };
}