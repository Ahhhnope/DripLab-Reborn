<template>
  <div class="receipts-page">

    <!-- Header -->
    <div class="receipts-page-header">
      <div>
        <nav class="breadcrumb">
          <span @click="goTo('/account')" class="breadcrumb-link">Account</span>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>Receipts</span>
        </nav>
        <h2 class="receipts-page-title">My Receipts</h2>
      </div>
      <button class="filter-btn">
        <span class="material-symbols-outlined">filter_list</span>
        Filter
      </button>
    </div>

    <!-- List -->
    <div class="receipts-list-card">
      <div class="receipts-list">
        <div
          v-for="receipt in receipts" :key="receipt.id"
          class="receipt-list-row"
        >
          <div class="receipt-list-left">
            <div class="receipt-list-icon">
              <span class="material-symbols-outlined">{{ receipt.icon }}</span>
            </div>
            <div class="receipt-list-info">
              <span class="receipt-list-date">{{ receipt.date }}</span>
              <span class="receipt-list-id">{{ receipt.id }}</span>
            </div>
            <div class="receipt-list-price">
              <span class="receipt-list-price-label">Total Price</span>
              <span class="receipt-list-price-value">{{ receipt.total }}</span>
            </div>
          </div>

          <div class="receipt-list-actions">
            <button class="receipt-download-btn" title="Download PDF">
              <span class="material-symbols-outlined">download</span>
            </button>
            <button class="receipt-view-btn" @click="openModal(receipt)">
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="receipts-pagination">
        <p class="pagination-info">Showing {{ receipts.length }} of 28 transactions</p>
        <div class="pagination-btns">
          <button class="page-btn"><span class="material-symbols-outlined">chevron_left</span></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn"><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="receipts-modal-box">

        <button class="receipts-modal-close" @click="closeModal">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="receipts-modal-inner">
          <div class="receipts-modal-header-row">
            <div class="receipts-modal-logo">
              <svg fill="none" viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="#bd490f" fill-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="receipts-modal-title">Receipt Details</h3>
              <p class="receipts-modal-id">ORDER {{ selectedReceipt.id }}</p>
            </div>
          </div>

          <div class="receipts-modal-body">
            <!-- Items -->
            <div class="receipts-modal-items">
              <h4 class="receipts-modal-section-label">Items</h4>
              <div
                v-for="item in selectedReceipt.items"
                :key="item.name"
                class="receipts-modal-item-row"
              >
                <span class="receipts-modal-item-name">{{ item.name }}</span>
                <span class="receipts-modal-item-price">{{ item.price }}</span>
              </div>
            </div>

            <!-- Summary -->
            <div class="receipts-modal-summary">
              <div class="receipts-modal-summary-block">
                <span class="receipts-modal-summary-label">Order Date</span>
                <p class="receipts-modal-summary-date">{{ selectedReceipt.date }}</p>
              </div>
              <div class="receipts-modal-summary-block">
                <span class="receipts-modal-summary-label">Total Price</span>
                <p class="receipts-modal-summary-total">{{ selectedReceipt.total }}</p>
                <span class="receipts-modal-summary-hint">Paid via Mastercard •••• 8842</span>
              </div>
            </div>
          </div>

          <div class="receipts-modal-footer">
            <button class="receipts-print-btn">
              <span class="material-symbols-outlined">print</span>
              Print Receipt
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { useUserReceipts } from '../JS-USER/UserReceipts.JS'

const {
  receipts,
  showModal, selectedReceipt,
  openModal, closeModal,
  goTo
} = useUserReceipts()
</script>

<style scoped src="../CSS-USER/UserReceipts.CSS"></style>