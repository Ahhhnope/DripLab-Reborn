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
    { key: "failed", label: "Giao không thành công", icon: "x" },
    { key: "cancelled", label: "Đã huỷ", icon: "ban" },
  ];

  // ✅ Chỉ ẩn bớt khi rơi vào 1 trong 3 trạng thái kết thúc
  // - delivered  -> ẩn failed, cancelled
  // - failed     -> ẩn delivered, cancelled
  // - cancelled  -> ẩn delivered, failed
  // Còn lại (pending/processing/shipping/khác) -> HIỆN FULL tất cả trạng thái
  function getVisibleSteps(currentStatus) {
    if (currentStatus === "delivered") {
      return statusSteps.filter((s) => ["pending", "processing", "shipping", "delivered"].includes(s.key));
    }
    if (currentStatus === "failed") {
      return statusSteps.filter((s) => ["pending", "processing", "shipping", "failed"].includes(s.key));
    }
    if (currentStatus === "cancelled") {
      return statusSteps.filter((s) => ["pending", "processing", "cancelled"].includes(s.key));
    }
    return statusSteps;
  }

  function close() {
    emit("update:open", false);
  }

  function emitConfirm() {
    emit("confirm", props.order);
    closse();
  }

  function emitCancel() {
    emit("cancel", props.order);
    close();
  }

  // ✅ Đổi trạng thái (confirm đã xử lý ở UI)
  function requestChangeStatus(nextStatus) {
    if (!props.order) return;

    // Component cha sẽ bắt event này để gọi API update status
    emit("set-status", { order: props.order, status: nextStatus });
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
