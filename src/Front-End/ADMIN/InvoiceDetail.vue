<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>
  <div class="popup-overlay">
    <div class="invoice-popup">

      <!-- Nút đóng -->
      <button class="popup-close" @click="$emit('close')">✕</button>

      <div class="order-section">
        <h2>
          Mã đơn hàng: {{ invoice.order_id }}
          <span class="status">Đã hủy</span>
        </h2>

        <!-- Danh sách sản phẩm -->
        <div class="product-list">
          <div
            class="product"
            v-for="(item, i) in invoice.items"
            :key="i"
          >
            <span>{{ item.qty }}x {{ item.name }}</span>
            <span class="price">—</span>
          </div>
        </div>

        <!-- Tổng tiền -->
        <div class="total-box">
          <p>
            <span>Tổng gốc:</span>
            <span>{{ invoice.original_price.toLocaleString('vi-VN') }} VND</span>
          </p>
          <p>
            <span>Khuyến mãi:</span>
            <span>- {{ invoice.discount.toLocaleString('vi-VN') }} VND</span>
          </p>
          <p>
            <span>Phí ship:</span>
            <span>{{ invoice.shipping.toLocaleString('vi-VN') }} VND</span>
          </p>
          <p>
            <span>Thành tiền:</span>
            <span>{{ invoice.final_price.toLocaleString('vi-VN') }} VND</span>
          </p>
          <p class="time">Thời gian đặt: {{ invoice.created_at }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({ invoice: Object })
defineEmits(['close'])
</script>