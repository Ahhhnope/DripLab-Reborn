export function useOrderTable(emit) {
  function money(v) {
    return new Intl.NumberFormat("vi-VN").format(v ?? 0) + " đ";
  }

  function statusText(s) {
    const map = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao",
      cancelled: "Đã huỷ",
    };
    return map[s] ?? s ?? "-";
  }

  function view(row) {
    emit("view", row);
  }
  function confirm(row) {
    emit("confirm", row);
  }
  function cancel(row) {
    emit("cancel", row);
  }

  return { money, statusText, view, confirm, cancel };
}
