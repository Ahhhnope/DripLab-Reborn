<style scoped src="../CSS/QLHatCF.CSS"></style>

<template>
  <div class="hcf-container">

    <!-- HEADER -->
    <div class="header">
      <h2>Quản lý Hạt Cà Phê</h2>
      <button class="btn-them" @click="openAdd">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Thêm mới
      </button>
    </div>

    <!-- SEARCH -->
    <div class="filter">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input v-model="search" @input="currentPage = 1" placeholder="Tìm tên loại hạt..." />
    </div>

    <!-- TABLE -->
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
          <th>Tên loại hạt</th>
          <th>Giá (VNĐ)</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>

        <template v-if="filtered.length === 0">
          <tr>
            <td colspan="6" class="empty-td">
              <div class="empty-icon">☕</div>
              <div>Không có dữ liệu</div>
            </td>
          </tr>
          <tr v-for="g in PAGE_SIZE" :key="'eg' + g" class="ghost-row">
            <td colspan="6"></td>
          </tr>
        </template>

        <template v-else>
          <tr v-for="(row, i) in pagedRows" :key="row.id">

            <td>{{ (currentPage - 1) * PAGE_SIZE + i + 1 }}</td>

            <td><span class="badge-id">{{ row.id }}</span></td>

            <td> {{ row.name }} </td>

            <td class="price">{{ fmtPrice(row.price) }}</td>

            <td class="date-cell">{{ fmtDate(row.createdAt) }}</td>

            <td>
              <div class="action-buttons">

                <button class="edit-btn" title="Sửa" @click="openEdit(row)">

                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>

                </button>
                <button class="delete-btn" title="Xóa" @click="openConfirm(row)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="g in ghostCount" :key="'g' + g" class="ghost-row">
            <td colspan="6"></td>
          </tr>
        </template>

      </tbody>
    </table>

    <!-- PAGINATION -->
    <div class="pgbar">
      <div class="pginfo" v-if="filtered.length > 0">
        Hiển thị {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} / {{ filtered.length }} dòng
      </div>
      <div class="pgctrl" v-if="totalPages > 1">
        <button class="pb" :disabled="currentPage === 1" @click="currentPage--">&#8249;</button>
        <button
          v-for="p in totalPages" :key="p"
          class="pb" :class="{ on: p === currentPage }"
          @click="currentPage = p"
        >{{ p }}</button>
        <button class="pb" :disabled="currentPage === totalPages" @click="currentPage++">&#8250;</button>
      </div>
    </div>

    <!-- FORM POPUP -->
    <div class="popup-overlay" :class="{ show: showForm }" @click.self="showForm = false">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? 'Chỉnh sửa hạt cà phê' : 'Thêm hạt cà phê' }}</h3>
          <button class="close-btn" @click="showForm = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Mã ID <em>(tự động)</em></label>
            <input :value="form.id" readonly />
          </div>
          <div class="form-group">
            <label>Ngày tạo <em>(tự động)</em></label>
            <input :value="form.ngayTaoDisp" readonly />
          </div>
          <div class="form-group full">
            <label>Tên loại hạt</label>
            <input
              ref="inputName"
              v-model="form.tenLoai"
              placeholder="VD: Arabica, Robusta..."
              @keyup.enter="handleSubmit"
            />
          </div>
          <div class="form-group full">
            <label>Giá (VNĐ)</label>
            <input
              v-model="form.gia"
              type="number"
              placeholder="VD: 50000"
              min="0"
              step="1"
              @keypress="blockDecimal"
              @keyup.enter="handleSubmit"
            />
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="showForm = false">Hủy</button>
          <button class="save-btn" @click="handleSubmit">
            {{ isEditing ? 'Cập nhật' : 'Lưu sản phẩm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CONFIRM XÓA -->
    <div class="popup-overlay" :class="{ show: showConfirm }" @click.self="showConfirm = false">
      <div class="confirm-popup">
        <div class="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444"
            stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <div class="confirm-title">Xác nhận xóa</div>
        <div class="confirm-msg">
          Bạn có chắc muốn xóa sản phẩm<br>
          <strong>{{ deleteTarget?.tenLoai }}</strong>?<br>
          Hành động này không thể hoàn tác.
        </div>
        <div class="confirm-actions">
          <button class="no-btn" @click="showConfirm = false">Hủy</button>
          <button class="yes-btn" @click="handleDelete">Xóa</button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>

  </div>
</template>

<script setup>
import { useIngredients } from '../JS/UseIngridients';

const {
  search, currentPage, PAGE_SIZE, pageStart,
  filtered, totalPages, pagedRows,
  fmtPrice, fmtDate,
  showForm, isEditing, inputName, form,
  openAdd, openEdit, submitForm,
  showConfirm, deleteTarget, openConfirm, doDelete,
  toastShow, toastMsg, toastType, showToast
} = useIngredients('coffee-beans', 'HCF');

const blockDecimal = (e) => {
  if (['-', '.', ',', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

const handleSubmit = async () => {
  let rawPrice = Number(form.value?.gia || 0);
  
  if (rawPrice < 0) {
    showToast('Giá không được để âm!', 'error');
    return;
  }
  
  if (!Number.isInteger(rawPrice)) {
    showToast('Giá phải là số nguyên!', 'error');
    form.value.gia = Math.floor(rawPrice);
    return;
  }

  const result = await submitForm();
  showToast(result.error || result.success, result.error ? 'error' : 'ok');
};

const handleDelete = async () => {
  const result = await doDelete();
  showToast(result.error || result.success, result.error ? 'error' : 'ok');
};
</script>