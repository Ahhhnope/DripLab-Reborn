<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>
  <div class="invoice-page">
    <div class="invoice-table">
      <h2>Quản lý hóa đơn</h2>

      <!-- FILTER -->
      <div class="filter">
        <input v-model="search" placeholder="Tìm theo mã hóa đơn hoặc mã đơn hàng" />
        <select v-model="paymentFilter">
          <option value="">Tất cả phương thức</option>
          <option value="Tiền mặt">Tiền mặt</option>
          <option value="Chuyển khoản">Chuyển khoản</option>
        </select>
        <input type="date" v-model="fromDate" />
        <input type="date" v-model="toDate" />
        <button class="btn-filter" @click="filterInvoice">Lọc</button>
        <button class="btn-reset"  @click="resetFilter">Xóa lọc</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã hóa đơn</th>
            <th>Mã đơn hàng</th>
            <th>Ngày hiện</th>
            <th>Phương thức thanh toán</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in filteredInvoices" :key="invoice.invoice_id">
            <td>{{ index + 1 }}</td>
            <td>{{ invoice.invoice_id }}</td>
            <td>{{ invoice.order_id }}</td>
            <td>{{ invoice.date }}</td>
            <td>{{ invoice.payment_method }}</td>
            <td>{{ invoice.final_price.toLocaleString('vi-VN') }} VND</td>
            <td>
              <button class="view-btn" @click="openInvoice(invoice)">Xem thêm</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Khách hàng -->
    <div class="customer-box" v-if="selectedInvoice">
      <h3>Thông tin khách hàng</h3>
      <p><strong>Mã KH:</strong>    {{ selectedInvoice.customer.id }}</p>
      <p><strong>Tên:</strong>      {{ selectedInvoice.customer.name }}</p>
      <p><strong>SĐT:</strong>      {{ selectedInvoice.customer.phone }}</p>
      <p><strong>Email:</strong>    {{ selectedInvoice.customer.email }}</p>
      <p><strong>Địa chỉ:</strong>  {{ selectedInvoice.customer.address }}</p>
    </div>
  </div>

  <InvoiceDetail
    v-if="showDetail"
    :invoice="selectedInvoice"
    @close="showDetail = false"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import InvoiceDetail from "./InvoiceDetail.vue"
import {
  filteredInvoices,
  search,
  paymentFilter,
  fromDate,
  toDate,
  loadInvoices,
  filterInvoice,
  resetFilter
} from '../JS/UseInvoice.JS'

const showDetail      = ref(false)
const selectedInvoice = ref(null)

function openInvoice(invoice) {
  selectedInvoice.value = invoice
  showDetail.value = true
}

onMounted(() => loadInvoices())
</script>