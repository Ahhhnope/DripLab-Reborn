<style scoped src="../CSS/AdminInvoice.CSS"></style>
<template>
  <div class="invoice-page">

    <!-- HEADER -->
    <div class="invoice-header">
      <h2>Quản lý hóa đơn</h2>
    </div>

    <!-- FILTER -->
    <div class="filter">
      <input v-model="search" placeholder="Tìm theo mã hóa đơn hoặc mã đơn hàng" />
      <select v-model="paymentFilter">
        <option value="">Tất cả phương thức</option>
        <option value="Tiền mặt">Tiền mặt</option>
        <option value="Chuyển khoản">Chuyển khoản</option>
        <option value="Momo">Momo</option>
      </select>
      <select v-model="receiveFilter">
        <option value="">Tất cả hình thức</option>
        <option value="Tại Quầy">Tại Quầy</option>
        <option value="Online">Online</option>
      </select>
      <input type="date" v-model="fromDate" />
      <input type="date" v-model="toDate" />
      <button class="btn-filter" @click="filterInvoice">Lọc</button>
      <button class="btn-reset" @click="resetFilter">Xóa lọc</button>
    </div>

    <!-- TABLE + CUSTOMER BOX -->
    <div class="invoice-body">

      <!-- TABLE -->
      <div class="invoice-table">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã hóa đơn</th>
              <th>Tên khách hàng</th>
              <th>Ngày</th>
              <th>Phương thức</th>
              <th>Nhận hàng</th>
              <th>Giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(invoice, index) in pagedInvoices"
              :key="invoice.invoice_id"
              :class="{ 'row-selected': selectedInvoice?.invoice_id === invoice.invoice_id }"
              @click="selectInvoice(invoice)"
            >
              <!-- STT liên tục qua các trang -->
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ invoice.invoice_id }}</td>
              <td>{{ invoice.customer.name }}</td>
              <td>{{ invoice.date }}</td>
              <td>{{ invoice.payment_method }}</td>
              <td>
                <span :class="invoice.receive_type === 'Online' ? 'badge-online' : 'badge-counter'">
                  {{ invoice.receive_type }}
                </span>
              </td>
              <td class="price-cell">{{ (invoice.finalPrice || 0).toLocaleString('vi-VN') }} đ</td>
              <td>
                <button class="view-btn" @click.stop="openInvoice(invoice)">Xem thêm</button>
              </td>
            </tr>
            <tr v-if="pagedInvoices.length === 0">
              <td colspan="8" class="empty-row">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>

        <!-- PHÂN TRANG -->
        <div class="pagination" v-if="totalPages > 1">
          <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">‹</button>

          <template v-for="page in totalPages" :key="page">
            <!-- Hiển thị trang đầu, cuối, và các trang gần currentPage -->
            <button
              v-if="page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >{{ page }}</button>
            <!-- Dấu ... -->
            <span
              v-else-if="Math.abs(page - currentPage) === 2"
              class="pagination-ellipsis"
            >…</span>
          </template>

          <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">›</button>

          <span class="pagination-info">
            {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredInvoices.length) }}
            / {{ filteredInvoices.length }}
          </span>
        </div>
      </div>

      <!-- CUSTOMER BOX -->
      <div class="customer-box">
        <h3>Thông tin khách hàng</h3>
        <div v-if="selectedInvoice" class="customer-info">
          <div class="customer-avatar">
            {{ selectedInvoice.customer.name?.charAt(0) || 'K' }}
          </div>
          <div class="customer-fields">
            <div class="customer-field">
              <span class="field-label">Mã KH</span>
              <span class="field-value">{{ selectedInvoice.customer.id }}</span>
            </div>
            <div class="customer-field">
              <span class="field-label">Tên</span>
              <span class="field-value">{{ selectedInvoice.customer.name }}</span>
            </div>
            <div class="customer-field">
              <span class="field-label">SĐT</span>
              <span class="field-value">{{ selectedInvoice.customer.phone }}</span>
            </div>
            <div class="customer-field" v-if="selectedInvoice.receive_type === 'Online'">
              <span class="field-label">Email</span>
              <span class="field-value">{{ selectedInvoice.customer.email }}</span>
            </div>
            <div class="customer-field" v-if="selectedInvoice.receive_type === 'Online'">
              <span class="field-label">Địa chỉ</span>
              <span class="field-value">{{ selectedInvoice.customer.address }}</span>
            </div>
          </div>
          <button class="view-detail-customer-btn" @click="openInvoice(selectedInvoice)">
            Xem chi tiết đơn hàng
          </button>
        </div>
        <div v-else class="customer-empty">
          <span class="material-symbols-outlined empty-icon">person_search</span>
          <p>Chọn hóa đơn để xem thông tin khách hàng</p>
        </div>
      </div>

    </div>
  </div>

  <!-- POPUP -->
  <InvoiceDetail
    v-if="showDetail"
    :invoice="selectedInvoice"
    @close="showDetail = false"
  />
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { bus } from "../../utils/bus"
import InvoiceDetail from "./InvoiceDetail.vue"
import {
  filteredInvoices, pagedInvoices,
  search, paymentFilter, receiveFilter, fromDate, toDate,
  currentPage, pageSize, totalPages,
  loadInvoices, filterInvoice, resetFilter, goToPage,
} from "../JS/UseInvoice.JS"

const showDetail      = ref(false)
const selectedInvoice = ref(null)

function selectInvoice(invoice) {
  selectedInvoice.value = invoice
}

function openInvoice(invoice) {
  selectedInvoice.value = invoice
  showDetail.value = true
}

watch(bus, () => { loadInvoices() })
onMounted(() => loadInvoices())
</script>