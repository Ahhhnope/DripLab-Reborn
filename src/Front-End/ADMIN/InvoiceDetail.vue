<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>

<div class="invoice-detail">

  <div class="detail-box">

    <button class="close" @click="$emit('close')">X</button>

    <h2>Mã đơn hàng</h2>

    <div class="order-items">

      <!-- Backend sẽ render list -->
      <div
        class="item"
        v-for="(item,index) in invoice?.items"
        :key="index"
      >
        SL: {{ item.qty }}
        {{ item.name }}
      </div>

    </div>

    <div class="price-box">

      <p>Tổng số tiền:</p>
      <p>Khuyến mãi:</p>
      <p>Tổng tiền sau chiết khấu:</p>
      <p>Thời gian đặt:</p>

    </div>

  </div>


  <!-- Khách hàng -->
  <div class="customer-box">

    <h3>Khách hàng</h3>

    <div class="avatar"></div>

    <p>Mã KH:</p>
    <p>Tên KH:</p>
    <p>SĐT:</p>
    <p>Email:</p>
    <p>Địa chỉ:</p>

  </div>

</div>

</template>

<script setup>
defineProps({
  invoice:Object
})
</script>