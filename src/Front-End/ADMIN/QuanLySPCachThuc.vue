<style scoped src="../CSS/QLCachThuc.css"></style>

<template>
  <div class="hcf-container">

    <!-- HEADER -->
    <div class="header">
      <h2>Quản lý Cách Thức</h2>
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
      <input v-model="search" @input="currentPage = 1" placeholder="Tìm tên cách thức..." />
    </div>

    <!-- TABLE -->
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
          <th>Tên cách thức</th>
          <th>Nội dung</th>
          <th>Giá</th>
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
        </template>

        <template v-else>
          <tr v-for="(row, i) in pagedRows" :key="row.id">
            <td>{{ (currentPage - 1) * PAGE_SIZE + i + 1 }}</td>
            <td><span class="badge-id">{{ row.id }}</span></td>
            <td>{{ row.name }}</td>
            <td class="price">{{ row.instructions }}</td>
            <td class="price">{{ fmtPrice(row.price) }}</td>
            <td>
              <div class="action-buttons">
                <!-- Icon bút chì -->
                <button class="edit-btn" title="Sửa" @click="requestEdit(row)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                <!-- Icon thùng rác -->
                <button class="delete-btn" title="Xóa" @click="requestDelete(row)">
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
          <h3>{{ isEditing ? 'Chỉnh sửa cách thức' : 'Thêm cách thức' }}</h3>
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
            <label>Tên cách thức</label>
            <input
              ref="inputName"
              v-model="form.name"
              placeholder="VD: Cold brew, Pour over..."
              @keyup.enter="requestSubmit"
            />
          </div>
          <div class="form-group full">
            <label>Nội dung hướng dẫn</label>
            <input
              v-model="form.instructions"
              placeholder="VD: Chiết xuất Espresso tiêu chuẩn 30ml..."
              @keyup.enter="requestSubmit"
            />
          </div>
          <div class="form-group full">
            <label>Giá (VNĐ)</label>
            <input
              v-model="form.price"
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
          <button class="save-btn" @click="requestSubmit">
            {{ isEditing ? 'Cập nhật' : 'Lưu' }}
          </button>
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

    <!-- TOAST -->
    <div class="toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '../../api/axios'

// ── Data State ─────────────────────────────────────
const rows       = ref([])
const search     = ref('')
const currentPage = ref(1)
const PAGE_SIZE  = 5

// ── UI State ───────────────────────────────────────
const showForm   = ref(false)
const isEditing  = ref(false)
const inputName  = ref(null)

// ── Form State ─────────────────────────────────────
const form = ref({
  id: '',
  name: '',
  instructions: '',
  price: 0,
  ngayTaoDisp: ''
})

// ── Confirm Modal ──────────────────────────────────
const showConfirmModal = ref(false)
const confirmMessage   = ref('')
const confirmAction    = ref(null)

function openConfirmModal(message, action) {
  confirmMessage.value   = message
  confirmAction.value    = action
  showConfirmModal.value = true
}

async function doConfirm() {
  if (confirmAction.value) await confirmAction.value()
  showConfirmModal.value = false
}

// ── Toast State ────────────────────────────────────
const toastShow = ref(false)
const toastMsg  = ref('')
const toastType = ref('ok')

const showToast = (msg, type = 'ok') => {
  toastMsg.value  = msg
  toastType.value = type === 'error' ? 'err' : type
  toastShow.value = true
  setTimeout(() => { toastShow.value = false }, 3000)
}

// ── Load Data ──────────────────────────────────────
const loadData = async () => {
  try {
    const res = await api.get('/instructions')
    rows.value = res.data
  } catch (error) {
    console.error('Failed to fetch instructions:', error)
    showToast('Không thể kết nối máy chủ', 'err')
  }
}

onMounted(loadData)

// ── Computed ───────────────────────────────────────
const filtered = computed(() =>
  rows.value.filter(r =>
    r.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE))
const pageStart  = computed(() => (currentPage.value - 1) * PAGE_SIZE)
const pagedRows  = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))
const ghostCount = computed(() => Math.max(0, PAGE_SIZE - pagedRows.value.length))

// ── Helpers ────────────────────────────────────────
const fmtPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ'
const fmtDate  = (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '---'

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
const generateNextId = () => {
  if (!rows.value || rows.value.length === 0) return '1'
  let maxNum = 0
  rows.value.forEach(row => {
    const parsed = parseInt(row.id, 10)
    if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed
  })
  return String(maxNum + 1)
}

// ── Open Add ───────────────────────────────────────
const openAdd = () => {
  isEditing.value = false
  form.value = {
    id: generateNextId(),
    name: '',
    instructions: '',
    price: 0,
    ngayTaoDisp: new Date().toLocaleDateString('vi-VN')
  }
  showForm.value = true
  nextTick(() => inputName.value?.focus())
}

// ── Open Edit (mở form, confirm khi bấm Lưu) ──────
function requestEdit(row) {
  isEditing.value = true
  form.value = {
    id: row.id,
    name: row.name,
    instructions: row.instructions,
    price: row.price,
    ngayTaoDisp: row.createdAt
      ? new Date(row.createdAt).toLocaleDateString('vi-VN')
      : new Date().toLocaleDateString('vi-VN')
  }
  showForm.value = true
  nextTick(() => inputName.value?.focus())
}

// ── Validate + Confirm trước khi Submit ───────────
function requestSubmit() {
  if (!form.value.name?.trim()) {
    showToast('Vui lòng nhập tên cách thức!', 'err')
    return
  }
  if (!form.value.instructions?.trim()) {
    showToast('Vui lòng nhập nội dung hướng dẫn!', 'err')
    return
  }
  let rawPrice = Number(form.value.price || 0)
  if (rawPrice < 0) {
    showToast('Giá không được để âm!', 'err')
    return
  }
  if (!Number.isInteger(rawPrice)) {
    showToast('Giá phải là số nguyên!', 'err')
    form.value.price = Math.floor(rawPrice)
    return
  }

  const label = isEditing.value
    ? 'Xác nhận cập nhật cách thức này?'
    : 'Xác nhận thêm cách thức mới?'
  openConfirmModal(label, handleSubmit)
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      await api.put(`instructions/update/${form.value.id}`, {
        name: form.value.name,
        instructions: form.value.instructions,
        price: Number(form.value.price)
      })
    } else {
      await api.post('instructions/add', {
        name: form.value.name,
        instructions: form.value.instructions,
        price: Number(form.value.price)
      })
    }
    showForm.value = false
    await loadData()
    showToast(isEditing.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'ok')
  } catch (e) {
    console.error(e)
    showToast(e.response?.data?.message || 'Thao tác thất bại', 'err')
  }
}

// ── Confirm trước khi Xóa ─────────────────────────
function requestDelete(row) {
  openConfirmModal(
    `Xác nhận xóa "${row.name}"? Hành động này không thể hoàn tác.`,
    () => handleDelete(row)
  )
}

async function handleDelete(row) {
  try {
    await api.delete(`instructions/remove/${row.id}`)
    await loadData()
    showToast('Đã xóa thành công!', 'ok')
  } catch (e) {
    console.error(e)
    showToast('Không thể xóa mục này', 'err')
  }
}
</script>