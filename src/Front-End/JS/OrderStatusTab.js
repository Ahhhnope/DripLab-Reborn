export const ORDER_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đang vận chuyển", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
  { label: "Giao hàng không thành công", value: "delivery_failed" },
  { label: "Đã huỷ", value: "cancelled" },
];

export function useOrderStatusTab(emit) {
  function select(value) {
    emit("update:modelValue", value);
  }
  return { select };
}
