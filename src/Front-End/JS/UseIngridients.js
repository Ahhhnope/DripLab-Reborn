import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:8080/api/ingredients'
const PAGE_SIZE = 5

export function useIngredients(type, prefix) {
  const data = ref([])
  const loading = ref(false)

  // ── API CALLS ─────────────────────────────────────
  const fetchIngredients = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE}/${type}`)
      data.value = response.data
    } catch (e) {
      console.error("Connection Error:", e)
    } finally {
      loading.value = false
    }
  }

  // ── Search & Pagination ───────────────────────────
  const search = ref('')
  const currentPage = ref(1)

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    // Matches 'name' from your Java DTO
    return q ? data.value.filter(r => r.name?.toLowerCase().includes(q)) : data.value
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
  const pageStart = computed(() => (currentPage.value - 1) * PAGE_SIZE)

  const pagedRows = computed(() => {
    return filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE)
  })

  // ── Helpers ───────────────────────────────────────
  const fmtPrice = (v) => Number(v).toLocaleString('vi-VN') + ' ₫'
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—'

  // ── Form Logic ────────────────────────────────────
  const showForm = ref(false)
  const isEditing = ref(false)
  const inputName = ref(null)
  const form = ref({ id: null, name: '', price: '' })

  const openAdd = () => {
    isEditing.value = false
    form.value = { id: null, name: '', price: '' }
    showForm.value = true
    nextTick(() => inputName.value?.focus())
  }

  const openEdit = (row) => {
    isEditing.value = true
    form.value = { ...row } 
    showForm.value = true
    nextTick(() => inputName.value?.focus())
  }

  const submitForm = async () => {
    if (!form.value.name?.trim() || !form.value.price) {
      return { error: 'Vui lòng nhập đầy đủ thông tin!' }
    }
    try {
      if (!isEditing.value) {
        await axios.post(`${API_BASE}/add/${type}`, form.value)
      } else {
        await axios.put(`${API_BASE}/update/${type}/${form.value.id}`, form.value)
      }
      await fetchIngredients()
      showForm.value = false
      return { success: isEditing.value ? 'Cập nhật thành công!' : 'Thêm thành công!' }
    } catch (e) {
      return { error: 'Lỗi server khi lưu dữ liệu!' }
    }
  }

  // ── Delete Logic ──────────────────────────────────
  const showConfirm = ref(false)
  const deleteTarget = ref(null)
  const openConfirm = (row) => { deleteTarget.value = row; showConfirm.value = true }

  const doDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/remove/${type}/${deleteTarget.value.id}`)
      showConfirm.value = false
      await fetchIngredients()
      return { success: 'Đã xóa thành công!' }
    } catch (e) {
      return { error: 'Lỗi khi xóa dữ liệu!' }
    }
  }

  // ── Toast Logic ───────────────────────────────────
  const toastShow = ref(false)
  const toastMsg = ref('')
  const toastType = ref('ok')
  let toastTimer

  const showToast = (msg, type = 'ok') => {
    toastMsg.value = msg; toastType.value = type; toastShow.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastShow.value = false }, 2800)
  }

  onMounted(fetchIngredients)

  return {
    search, currentPage, PAGE_SIZE, pageStart,
    filtered, totalPages, pagedRows,
    fmtPrice, fmtDate,
    showForm, isEditing, inputName, form,
    openAdd, openEdit, submitForm,
    showConfirm, deleteTarget, openConfirm, doDelete,
    toastShow, toastMsg, toastType, showToast,
  }
}

// THIS PREVENTS VITE ERRORS
export default useIngredients;