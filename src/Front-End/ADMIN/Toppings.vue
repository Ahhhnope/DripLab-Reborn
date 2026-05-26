<style scoped src="../CSS/QLHatCF.CSS"></style>

<template>
  <div class="hcf-container">
    <div class="header">
      <h2>Quản lý Topping</h2>
      <button class="btn-them" @click="openAdd">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm mới
      </button>
    </div>
    <div class="filter">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input v-model="search" @input="currentPage = 1" placeholder="Tìm tên Topping..." />
    </div>
    <table>
      <thead>
        <tr>
          <th>STT</th><th>ID</th><th>Tên Topping</th>
          <th>Giá (VNĐ)</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filtered.length === 0">
          <tr><td colspan="7" class="empty-td"><div class="empty-icon">☕</div><div>Không có dữ liệu</div></td></tr>
          <tr v-for="g in PAGE_SIZE" :key="'eg'+g" class="ghost-row"><td colspan="7"></td></tr>
        </template>
        <template v-else>
          <tr v-for="(row, i) in pagedRows" :key="row.id">
            <td>{{ pageStart + i + 1 }}</td>
            <td><span class="badge-id">{{ row.id }}</span></td>
            <td>{{ row.name }}</td>
            <td class="price">{{ fmtPrice(row.price) }}</td>
            <td class="date-cell">{{ fmtDate(row.createdAt) }}</td>
            <td class="status-cell">{{ row.status ? "Đang hoạt động" : "Đã tắt" }}</td>
            <td class="px">
              <div class="action-buttons">
                <button class="edit-btn" title="Sửa" @click="requestEdit(row)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>

                <!-- Toggle switch (giống HatCF) -->
                <label class="toggle-switch" :title="row.status ? 'Tắt' : 'Bật'">
                  <input type="checkbox" :checked="row.status"
                    @change="requestToggle(row)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </td>
          </tr>
          <tr v-for="g in ghostCount" :key="'g'+g" class="ghost-row"><td colspan="7"></td></tr>
        </template>
      </tbody>
    </table>
    <div class="pgbar">
      <div class="pginfo" v-if="filtered.length > 0">
        Hiển thị {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} / {{ filtered.length }} dòng
      </div>
      <div class="pgctrl" v-if="totalPages > 1">
        <button class="pb" :disabled="currentPage === 1" @click="currentPage--">&#8249;</button>
        <button v-for="p in totalPages" :key="p" class="pb" :class="{ on: p === currentPage }" @click="currentPage = p">{{ p }}</button>
        <button class="pb" :disabled="currentPage === totalPages" @click="currentPage++">&#8250;</button>
      </div>
    </div>

    <!-- FORM POPUP -->
    <div class="popup-overlay" :class="{ show: showForm }" @click.self="showForm = false">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? 'Chỉnh sửa Topping' : 'Thêm Topping' }}</h3>
          <button class="close-btn" @click="showForm = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group"><label>Mã ID <em>(tự động)</em></label><input :value="form.id" readonly /></div>
          <div class="form-group"><label>Ngày tạo <em>(tự động)</em></label><input :value="form.ngayTaoDisp" readonly /></div>
          <div class="form-group full"><label>Tên Topping</label><input ref="inputName" v-model="form.tenLoai" placeholder="VD: Trân châu, Thạch dừa..." @keyup.enter="requestSubmit" /></div>
          <div class="form-group full">
            <label>Giá (VNĐ)</label>
            <input
              v-model="form.gia"
              type="number"
              placeholder="VD: 50000"
              min="0"
              step="1"
              @keypress="blockDecimal"
              @paste="blockPaste"
              @input="sanitizePrice"
              @blur="clampPrice"
              @keyup.enter="handleSubmit"
            />
            <span v-if="priceError" class="field-error">{{ priceError }}</span>
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="showForm = false">Hủy</button>
          <button class="save-btn" @click="requestSubmit">{{ isEditing ? 'Cập nhật' : 'Lưu sản phẩm' }}</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM MODAL -->
    <div class="popup-overlay" :class="{ show: showConfirmModal }" @click.self="showConfirmModal = false">
      <div class="confirm-popup">
        <div class="confirm-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
            viewBox="0 0 24 24" fill="none" stroke="#6b7280"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="confirm-title">{{ confirmMessage }}</div>
        <div class="confirm-actions">
          <button class="no-btn" @click="showConfirmModal = false">Hủy</button>
          <button class="yes-btn yes-btn--green" @click="doConfirm">Đồng ý</button>
        </div>
      </div>
    </div>

    <div class="toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIngredients } from '../JS/UseIngridients';

const {
  search, currentPage, PAGE_SIZE, pageStart,
  filtered, totalPages, pagedRows, ghostCount,
  fmtPrice, fmtDate,
  showForm, isEditing, inputName, form,
  openAdd, openEdit, submitForm,
  showConfirm, deleteTarget, openConfirm, doDelete,
  switchStatus, switchStatusTarget, openConfirmSwitchStatus,
  toastShow, toastMsg, toastType, showToast
} = useIngredients('toppings', 'TP');

// ── Confirm modal ──────────────────────────────────
const showConfirmModal = ref(false);
const confirmMessage   = ref('');
const confirmAction    = ref(null);

function openConfirmModal(message, action) {
  confirmMessage.value = message;
  confirmAction.value  = action;
  showConfirmModal.value = true;
}

async function doConfirm() {
  if (confirmAction.value) await confirmAction.value();
  showConfirmModal.value = false;
}

// ── Validate & submit ──────────────────────────────
const priceError = ref('');

// already have this, just add '+' to the list
const blockDecimal = (e) => {
  if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) e.preventDefault();
};

const blockPaste = (e) => {
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  if (!/^\d+$/.test(pasted.trim())) {
    e.preventDefault();
    priceError.value = 'Giá chỉ được chứa chữ số nguyên dương!';
    setTimeout(() => { priceError.value = ''; }, 3000);
  }
};

const sanitizePrice = () => {
  const clean = String(form.value.gia ?? '').replace(/[^\d]/g, '');
  form.value.gia = clean === '' ? 0 : parseInt(clean, 10);
};

const clampPrice = () => {
  const num = Number(form.value.gia);
  if (isNaN(num) || num < 0) {
    form.value.gia = 0;
    priceError.value = 'Giá không được âm — đã đặt lại về 0.';
    setTimeout(() => { priceError.value = ''; }, 3000);
  }
};

function requestSubmit() {
  let rawPrice = Number(form.value?.gia || 0);
  if (rawPrice < 0) { showToast('Giá không được để âm!', 'error'); return; }
  if (!Number.isInteger(rawPrice)) {
    showToast('Giá phải là số nguyên!', 'error');
    form.value.gia = Math.floor(rawPrice);
    return;
  }
  const label = isEditing.value ? 'Xác nhận cập nhật Topping?' : 'Xác nhận thêm Topping mới?';
  openConfirmModal(label, handleSubmit);
}

async function handleSubmit() {
  const result = await submitForm();
  showToast(result.error || result.success, result.error ? 'error' : 'ok');
}

// ── Mở sửa ────────────────────────────────────────
function requestEdit(row) {
  openEdit(row); // form điền sẵn, confirm khi bấm Lưu
}

// ── Bật / Tắt ─────────────────────────────────────
function requestToggle(row) {
  const msg = row.status ? 'Xác nhận tạm dừng nguyên liệu này?' : 'Xác nhận hiện nguyên liệu này?';
  openConfirmModal(msg, async () => {
    openConfirmSwitchStatus(row);
    const result = await switchStatus();
    if (result) {
      const msg = result.error
        ? result.error
        : (row.status ? 'Đã tạm dừng nguyên liệu!' : 'Đã hiện nguyên liệu!');
      showToast(msg, result.error ? 'error' : 'ok');
    }
  });
}
</script>