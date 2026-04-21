// Front-End/JS/OrderTable.js
export function useOrderTable(emit) {
  // ── Format tiền VNĐ ──────────────────────────────────────
  function money(v) {
    return new Intl.NumberFormat("vi-VN").format(v ?? 0) + " đ";
  }

  // ── Label trạng thái ─────────────────────────────────────
  function statusText(s) {
    const map = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao",
      cancelled: "Đã huỷ",
      delivery_failed: "Giao hàng không thành công",
    };
    return map[s] ?? s ?? "-";
  }

  // ── Tailwind class badge theo trạng thái ─────────────────
  function statusClass(s) {
    const map = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipping: "bg-indigo-50 text-indigo-700 border-indigo-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      delivery_failed: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return map[s] ?? "bg-slate-50 text-slate-700 border-slate-200";
  }

  // ── Helpers emit (dùng bởi component cha nếu cần) ────────
  function view(row) {
    emit("view", row);
  }
  function confirm(row) {
    emit("confirm", row);
  }
  function cancel(row) {
    emit("cancel", row);
  }
  function deliveryFailed(row) {
    emit("delivery-failed", row);
  }

  return { money, statusText, statusClass, view, confirm, cancel, deliveryFailed };
}
