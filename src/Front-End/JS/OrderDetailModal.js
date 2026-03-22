
import { computed, ref, watch } from "vue";

export function useOrderDetailModal(props, emit, { money, statusText }) {
  const loading = ref(false);
  const error = ref("");
  const order = ref(null);

  const canConfirm = computed(() => order.value?.status === "pending");
  const canCancel = computed(() =>
    ["pending", "processing"].includes(order.value?.status)
  );

  function close() {
    emit("update:open", false);
  }

  function emitConfirm() {
    emit("confirm", order.value);
  }

  function emitCancel() {
    emit("cancel", order.value);
  }

  // Bạn đổi URL theo backend của bạn
  async function fetchOrderDetail(code) {
    if (!code) return;

    loading.value = true;
    error.value = "";

    try {
      const res = await fetch(`/api/orders/${code}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Chuẩn hoá data để UI dùng (tuỳ backend bạn)
      order.value = {
        code: data.code,
        status: data.status,
        shippingType: data.shippingType,
        createdAt: data.createdAt,
        customer: data.customer,
        items: data.items || [],
        subtotal: data.subtotal ?? 0,
        discount: data.discount ?? 0,
        pay: data.pay ?? 0,
      };
    } catch (e) {
      error.value = "Không tải được chi tiết đơn hàng. Vui lòng thử lại.";
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => [props.open, props.orderCode],
    ([isOpen, code]) => {
      if (isOpen && code) fetchOrderDetail(code);

      if (!isOpen) {
        order.value = null;
        error.value = "";
        loading.value = false;
      }
    }
  );

  return {
    loading,
    error,
    order,
    canConfirm,
    canCancel,
    close,
    emitConfirm,
    emitCancel,
    fetchOrderDetail,
    money,
    statusText,
  };
}
