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
    { id: 1, code: "719523346", shippingType: "Đã giao", status: "delivered", qty: 1, pay: 0, deadline: "Hôm nay 09:28:00" },
    { id: 2, code: "750602738", shippingType: "Đang xử lý", status: "processing", qty: 5, pay: 1450374, deadline: "06/03/2026 14:05:07" },
  ]);

  const items = computed(() => {
    const k = filter.value.keyword.trim().toLowerCase();
    const status = filter.value.status; // nếu bạn muốn ưu tiên tab thì dùng activeTab.value

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
