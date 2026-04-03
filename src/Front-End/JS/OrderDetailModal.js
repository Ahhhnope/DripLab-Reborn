import { ref, watch } from "vue";
 
export function useOrderDetailModal(props, emit, { money, statusText }) {
  const loading = ref(false);
  const error   = ref("");
 
  function close() {
    emit("update:open", false);
  }
 
  function emitConfirm() {
    emit("confirm", props.order);
  }
 
  function emitCancel() {
    emit("cancel", props.order);
  }
 
  // Gọi API lấy chi tiết (nếu backend sẵn sàng)
  // Hiện tại dùng props.order truyền thẳng từ cha nên fetchOrderDetail là tùy chọn
  async function fetchOrderDetail(code) {
    if (!code) return;
 
    loading.value = true;
    error.value   = "";
 
    try {
      const res = await fetch(`/api/orders/${code}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Data sẽ được xử lý bởi component cha qua emit hoặc store
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
        error.value   = "";
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
    money,
    statusText,
  };
}