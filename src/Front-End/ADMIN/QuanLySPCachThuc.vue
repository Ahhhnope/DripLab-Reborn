<style scoped src="../CSS/QLCachThuc.css">
</style>

<template>
  <div class="hcf-container">
    <div class="header">
      <h2>Quản lý Cách Thức</h2>
      <button class="btn-them" @click="openAdd">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm mới
      </button>
    </div>
    <div class="filter">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input v-model="search" @input="currentPage = 1" placeholder="Tìm tên cách thức..." />
    </div>
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
          <th>Tên cách thức</th>
          <th>Nội dung</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filtered.length === 0">
          <tr><td colspan="5" class="empty-td"><div class="empty-icon">☕</div><div>Không có dữ liệu</div></td></tr>
          <tr v-for="g in PAGE_SIZE" :key="'eg'+g" class="ghost-row"><td colspan="5"></td></tr>
        </template>
        <template v-else>
          <tr v-for="(row, i) in pagedRows" :key="row.id">
            <td>{{ pageStart + i + 1 }}</td>
            <td><span class="badge-id">{{ row.id }}</span></td>
            <td>{{ row.name }}</td>
            <td class="price">{{ row.instructions }}</td>
            <td>
              <div class="action-buttons">
                <button class="edit-btn" title="Sửa" @click="openEdit(row)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="delete-btn" title="Xóa" @click="openConfirm(row)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="g in ghostCount" :key="'g'+g" class="ghost-row"><td colspan="6"></td></tr>
        </template>
      </tbody>
    </table>
    <div class="pgbar">
      <div class="pginfo" v-if="filtered.length > 0">Hiển thị {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} / {{ filtered.length }} dòng</div>
      <div class="pgctrl" v-if="totalPages > 1">
        <button class="pb" :disabled="currentPage === 1" @click="currentPage--">&#8249;</button>
        <button v-for="p in totalPages" :key="p" class="pb" :class="{ on: p === currentPage }" @click="currentPage = p">{{ p }}</button>
        <button class="pb" :disabled="currentPage === totalPages" @click="currentPage++">&#8250;</button>
      </div>
    </div>
    <div class="popup-overlay" :class="{ show: showForm }" @click.self="showForm = false">
      <div class="popup">
        <div class="popup-header">
          <h3>{{ isEditing ? 'Chỉnh sửa cách thức' : 'Thêm cách thức' }}</h3>
          <button class="close-btn" @click="showForm = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group"><label>Mã ID <em>(tự động)</em></label><input :value="form.id" readonly /></div>
          <div class="form-group"><label>Ngày tạo <em>(tự động)</em></label><input :value="form.ngayTaoDisp" readonly /></div>
          <div class="form-group full"><label>Tên cách thức</label><input ref="inputName" v-model="form.name" placeholder="VD: Cold brew, Pour over..." @keyup.enter="handleSubmit" /></div>
          <div class="form-group full">
            <label>Nội dung hướng dẫn</label>
            <input 
              v-model="form.instructions" 
              placeholder="VD: Chiết xuất Espresso tiêu chuẩn 30ml..." 
              @keyup.enter="handleSubmit" 
            />
          </div>
        </div>
        <div class="popup-actions">
          <button class="cancel-btn" @click="showForm = false">Hủy</button>
          <button class="save-btn" @click="handleSubmit">{{ isEditing ? 'Cập nhật' : 'Lưu' }}</button>
        </div>
      </div>
    </div>
    <div class="popup-overlay" :class="{ show: showConfirm }" @click.self="showConfirm = false">
      <div class="confirm-popup">
        <div class="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div class="confirm-title">Xác nhận xóa</div>
        <div class="confirm-msg">Bạn có chắc muốn xóa <strong>{{ deleteTarget?.tenLoai }}</strong>?<br>Hành động này không thể hoàn tác.</div>
        <div class="confirm-actions">
          <button class="no-btn" @click="showConfirm = false">Hủy</button>
          <button class="yes-btn" @click="handleDelete">Xóa</button>
        </div>
      </div>
    </div>
    <div class="toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api/axios'

// state
const rows = ref([])
const search = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 5

// form
const showForm = ref(false)
const isEditing = ref(false)

const generateNextId = () => {
  if (!rows.value || rows.value.length === 0) {
    return "1"; // Start at 1 if the table is empty
  }

  let maxNum = 0;
  rows.value.forEach(row => {
    const parsed = parseInt(row.id, 10);
    if (!isNaN(parsed) && parsed > maxNum) {
      maxNum = parsed;
    }
  });

  return String(maxNum + 1);  
};

const form = ref({
  id: "",
  name: '',
  instructions: '',
  ngayTaoDisp: "",
})

// delete
const showConfirm = ref(false)
const deleteTarget = ref(null)

// toast
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('')

// ================= LOAD =================
const loadData = async () => {
  const res = await api.get('/instructions');
  rows.value = res.data
}

onMounted(loadData)

// ================= FILTER =================
const filtered = computed(() => {
  return rows.value.filter(r =>
    r.name?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const totalPages = computed(() =>
  Math.ceil(filtered.value.length / PAGE_SIZE)
)

const pageStart = computed(() =>
  (currentPage.value - 1) * PAGE_SIZE
)

const pagedRows = computed(() =>
  filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE)
)

const ghostCount = computed(() =>
  PAGE_SIZE - pagedRows.value.length
)

// ================= ACTIONS =================
const openAdd = () => {
  isEditing.value = false
  form.value = {
    id: generateNextId(),
    name: '',
    instructions: '',
    ngayTaoDisp: new Date().toLocaleDateString('vi-VN')
  }
  showForm.value = true
}

const openEdit = (row) => {
  isEditing.value = true
  form.value = { ...row,
    ngayTaoDisp: new Date().toLocaleDateString('vi-VN')
   }
  showForm.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await api.put(`instructions/update/${form.value.id}`, form.value);
    } else {
      const {id, ngayTaoDisp, ...payLoad} = form.value
      await api.post('instructions/add', payLoad);
    }

    showForm.value = false
    await loadData()
    showToast('Success', 'ok')
  } catch (e) {
    console.error(e)
    showToast('Error', 'err')
  }
}

const openConfirm = (row) => {
  deleteTarget.value = row
  showConfirm.value = true
}

const handleDelete = async () => {
  try {
    await api.delete(`instructions/remove/${deleteTarget.value.id}`);
    showConfirm.value = false
    await loadData()
    showToast('Deleted', 'ok')
  } catch (e) {
    console.error(e)
    showToast('Error', 'err')
  }
}

// ================= UTILS =================
const fmtPrice = (p) => p?.toLocaleString('vi-VN') + ' đ'

const fmtDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN')
}

const showToast = (msg, type) => {
  toastMsg.value = msg
  toastType.value = type
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2000)
}
</script>