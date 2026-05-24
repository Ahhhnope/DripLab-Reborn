import { ref, watch } from "vue";

export function useOrderDetailModal(props, emit, { money, statusText }) {
  const loading = ref(false);
  const error = ref("");

  // icon: tên dùng trong template (svg inline)
  const statusSteps = [
    { key: "pending", label: "Chờ xác nhận", icon: "doc" },
    { key: "processing", label: "Đang xử lý", icon: "gear" },
    { key: "shipping", label: "Đang vận chuyển", icon: "truck" },
    { key: "delivered", label: "Đã giao", icon: "home" },
    { key: "delivery_failed", label: "Giao không thành công", icon: "x" },
    { key: "cancelled", label: "Đã huỷ", icon: "ban" },
  ];

  // ✅ Chỉ ẩn bớt khi rơi vào 1 trong 3 trạng thái kết thúc
  // - delivered        -> ẩn delivery_failed, cancelled
  // - delivery_failed  -> ẩn delivered, cancelled
  // - cancelled        -> ẩn delivered, delivery_failed
  // Còn lại (pending/processing/shipping/khác) -> HIỆN FULL tất cả trạng thái
  function getVisibleSteps(currentStatus) {
  if (currentStatus === "delivered") {
    return statusSteps.filter((s) =>
      ["pending", "processing", "shipping", "delivered"].includes(s.key)
    );
  }
  if (currentStatus === "delivery_failed") {
    return statusSteps.filter((s) =>
      ["pending", "processing", "shipping", "delivery_failed"].includes(s.key)
    );
  }
  if (currentStatus === "cancelled") {
    return statusSteps.filter((s) =>
      ["pending", "processing", "cancelled"].includes(s.key)
    );
  }

  const MAIN_FLOW = ["pending", "processing", "shipping", "delivered"];
  const curIdx = MAIN_FLOW.indexOf(currentStatus);

  return statusSteps.filter((s) => {
    if (MAIN_FLOW.includes(s.key)) {
      const idx = MAIN_FLOW.indexOf(s.key);
      return idx <= curIdx + 1;
    }
    if (s.key === "cancelled") return true;
    // ✅ Hiện delivery_failed khi đang ở shipping trở đi
    if (s.key === "delivery_failed") return curIdx >= 2; // index 2 = "shipping"
    return false;
  });
}

  function close() {
    emit("update:open", false);
  }

  function emitConfirm() {
    requestChangeStatus("processing");
  }

  function emitCancel() {
    requestChangeStatus("cancelled");
  }

  // ✅ Đổi trạng thái (confirm đã xử lý ở UI)
  function requestChangeStatus(nextStatus, reason = null) {
    if (!props.order) return;

    emit("set-status", {
      id: props.order.id,
      status: nextStatus,
      reason,
    });
  }

  // Gọi API lấy chi tiết (nếu backend sẵn sàng)
  async function fetchOrderDetail(code) {
    if (!code) return;

    loading.value = true;
    error.value = "";

    try {
      // TODO: thay URL này theo backend thật của bạn
      // const res = await fetch(`/api/orders/${code}`);
      // if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      error.value = "Không tải được chi tiết đơn hàng. Vui lòng thử lại.";
    } finally {
      loading.value = false;
    }
  }

  // Reset state khi đóng modal
  watch(
    () => props.open,
    (isOpen) => {
      if (!isOpen) {
        error.value = "";
        loading.value = false;
      }
    }
  );

  return {
    loading,
    error,
    close,
    emitConfirm,
    emitCancel,
    fetchOrderDetail,
    requestChangeStatus,
    statusSteps,
    getVisibleSteps,
    money,
    statusText,
  };
}