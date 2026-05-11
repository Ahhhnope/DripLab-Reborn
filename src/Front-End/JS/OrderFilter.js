import { reactive } from "vue";

export function useOrderFilter(emit) {
  const form = reactive({
    keyword: "",
    status: "all",
    type: "all",
    fromDate: "",
    toDate: "",
  });

  function apply() {
    if (form.fromDate && form.toDate && form.fromDate > form.toDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    emit("apply", {
      keyword: form.keyword.trim(),
      status: form.status,
      type: form.type,
      fromDate: form.fromDate || null,
      toDate: form.toDate || null,
    });
  }

  // Hàm lọc danh sách đơn hàng
  function filterOrders(orders) {
    return orders.filter((order) => {
      // Parse ngày đặt hàng — hỗ trợ format "15:20:40 11/5/2026"
      const parseOrderDate = (dateStr) => {
        // Tách phần ngày ra khỏi "HH:mm:ss DD/MM/YYYY"
        const parts = dateStr.trim().split(" ");
        const datePart = parts.length === 2 ? parts[1] : parts[0];
        const [day, month, year] = datePart.split("/");
        return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
      };

      const orderDate = parseOrderDate(order.createdAt); // đổi "createdAt" theo field thực tế

      // Lọc fromDate
      if (form.fromDate) {
        const from = new Date(form.fromDate); // "YYYY-MM-DD" → Date tự parse đúng
        if (orderDate < from) return false;
      }

      // Lọc toDate
      if (form.toDate) {
        const to = new Date(form.toDate);
        to.setHours(23, 59, 59, 999); // Bao gồm cả ngày kết thúc
        if (orderDate > to) return false;
      }

      // Lọc keyword
      if (form.keyword && !order.id.toString().includes(form.keyword.trim())) {
        return false;
      }

      // Lọc status
      if (form.status !== "all" && order.status !== form.status) return false;

      // Lọc type
      if (form.type !== "all" && order.type !== form.type) return false;

      return true;
    });
  }

  function reset() {
    form.keyword = "";
    form.status = "all";
    form.type = "all";
    form.fromDate = "";
    form.toDate = "";
    emit("reset");
    apply();
  }

  return { form, apply, reset, filterOrders };
}