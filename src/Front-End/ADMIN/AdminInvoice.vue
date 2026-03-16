<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>
  <div class="invoice-page">

    <!-- Bảng hóa đơn -->
    <div class="invoice-table">
      <h2>Quản lý hóa đơn</h2>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã hóa đơn</th>
            <th>Mã đơn hàng</th>
            <th>Ngày hiện</th>
            <th>Phương thức thanh toán</th>
            <th>Giá</th>
            <th>Xem</th>
          </tr>
        </thead>

        <tbody>
          <!-- Backend sẽ đẩy data -->
          <tr v-for="(invoice,index) in invoices" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ invoice.invoice_id }}</td>
            <td>{{ invoice.order_id }}</td>
            <td>{{ invoice.date }}</td>
            <td>{{ invoice.payment_method }}</td>
            <td>{{ invoice.final_price }}</td>

            <td>
              <button @click="openInvoice(invoice)">
                xem thêm
              </button>
            </td>
          </tr>
        </tbody>
      </table>

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

    <!-- Popup chi tiết hóa đơn -->
    <InvoiceDetail
      v-if="showDetail"
      :invoice="selectedInvoice"
      @close="showDetail=false"
    />

  </div>
</template>

<script setup>

import { ref } from "vue"
import InvoiceDetail from "./InvoiceDetail.vue"

const invoices = ref([]) 
// backend sau này sẽ push data vào đây

const showDetail = ref(false)
const selectedInvoice = ref(null)

function openInvoice(invoice){
  selectedInvoice.value = invoice
  showDetail.value = true
}

</script>