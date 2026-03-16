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
            <th></th>
          </tr>
        </thead>

        <tbody>
          <!-- Backend sẽ đẩy data -->
          <tr v-for="(invoice, index) in invoices" :key="invoice.invoice_id">
            <td>{{ index + 1 }}</td>
            <td>{{ invoice.invoice_id }}</td>
            <td>{{ invoice.order_id }}</td>
            <td>{{ invoice.date }}</td>
            <td>{{ invoice.payment_method }}</td>
            <td>{{ invoice.final_price }} VND</td>

            <td>
              <button @click="openInvoice(invoice)">xem thêm</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Khách hàng -->
    <div class="customer-box" v-if="selectedInvoice">
      <h3>Khách hàng</h3>

      <p>Mã KH: {{ selectedInvoice.customer.id }}</p>
      <p>Tên KH: {{ selectedInvoice.customer.name }}</p>
      <p>SĐT: {{ selectedInvoice.customer.phone }}</p>
      <p>Email: {{ selectedInvoice.customer.email }}</p>
      <p>Địa chỉ: {{ selectedInvoice.customer.address }}</p>
    </div>
  </div>
  <!-- Popup chi tiết hóa đơn -->
  <InvoiceDetail
    v-if="showDetail"
    :invoice="selectedInvoice"
    @close="showDetail = false"
  />
</template>

<script setup>
import { ref } from "vue";
import InvoiceDetail from "./InvoiceDetail.vue";

const invoices = ref([
  {
    invoice_id: "HD_01",
    order_id: "DH_01",
    date: "20/03/2026",
    payment_method: "Tiền mặt",
    final_price: 45000,

    customer: {
      id: "KH_01",
      name: "Nguyễn Văn A",
      phone: "0988888888",
      email: "a@gmail.com",
      address: "Hà Nội",
    },

    items: [
      { name: "Cà phê sữa", qty: 1 },
      { name: "Topping trân châu", qty: 1 },
      { name: "Size L", qty: 1 },
    ],

    original_price: 50000,
    discount: 5000,
    shipping: 0,
    created_at: "20/03/2026 13:38",
  },

  {
    invoice_id: "HD_02",
    order_id: "DH_02",
    date: "21/03/2026",
    payment_method: "Chuyển khoản",
    final_price: 65000,

    customer: {
      id: "KH_02",
      name: "Trần Văn B",
      phone: "0977777777",
      email: "b@gmail.com",
      address: "Hồ Chí Minh",
    },

    items: [
      { name: "Cold Brew", qty: 1 },
      { name: "Kem cheese", qty: 1 },
    ],

    original_price: 70000,
    discount: 5000,
    shipping: 0,
    created_at: "21/03/2026 09:20",
  },
]);
// backend sau này sẽ push data vào đây

const showDetail = ref(false);
const selectedInvoice = ref(null);

function openInvoice(invoice) {
  selectedInvoice.value = invoice;
  showDetail.value = true;
}
</script>
