<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>

<div class="popup-overlay">

  <div class="invoice-popup">

    <!-- LEFT: Order detail -->
    <div class="order-section">

      <button class="popup-close" @click="$emit('close')">X</button>

      <h2>
        Mã đơn hàng: {{ invoice.order_id }}
        <span class="status">Đã hủy</span>
      </h2>

      <div class="product-list">

        <div class="product">
          <span>Số Lượng:</span>
          <span>Tên Sản Phẩm 1</span>
          <span class="price">VND</span>
        </div>

        <ul>
          <li>1x Topping 1</li>
          <li>2x Topping 2</li>
          <li>1x Size L</li>
        </ul>

      </div>

      <div class="total-box">

        <p>Tổng số tiền: <span>VND</span></p>
        <p>Khuyến mãi: <span>VND</span></p>
        <p>Tổng tiền sau chiết khấu: <span>VND</span></p>

        <p class="time">
          Thời gian đặt:
          <span>Hôm nay 13:38</span>
        </p>

      </div>

    </div>

  </div>

</div>

</template>

<script setup>
defineProps({
  invoice: Object,
});
</script>
