import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const STORAGE_KEY = 'hcf_vue3'
const PAGE_SIZE   = 5

const SEED = [
  { id: 'HCF_01', tenLoai: 'Americano', gia: 20000, ngayTao: '2020-10-20' },
  { id: 'HCF_02', tenLoai: 'Robusta',   gia: 10000, ngayTao: '2026-01-04' },
  { id: 'HCF_03', tenLoai: 'Arabica',   gia: 35000, ngayTao: '2026-02-15' },
  { id: 'HCF_04', tenLoai: 'Liberica',  gia: 28000, ngayTao: '2026-03-01' },
  { id: 'HCF_05', tenLoai: 'Excelsa',   gia: 42000, ngayTao: '2026-03-10' },
  { id: 'HCF_06', tenLoai: 'Moka',      gia: 55000, ngayTao: '2026-03-18' },
  { id: 'HCF_07', tenLoai: 'Culi',      gia: 38000, ngayTao: '2026-03-20' },
]

export default function useHatCaPhe() {

  // ── Data / LocalStorage ───────────────────────────
  let init = []
  try { init = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch (e) {}
  if (!init.length) init = JSON.parse(JSON.stringify(SEED))

  const data = ref(init)
  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value)) } catch (e) {}
  }

  // ── Search & Pagination ───────────────────────────
  const search      = ref('')
  const currentPage = ref(1)

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return q ? data.value.filter(r => r.tenLoai.toLowerCase().includes(q)) : data.value
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
  const pageStart  = computed(() => (currentPage.value - 1) * PAGE_SIZE)
  const pagedRows  = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))
  const ghostCount = computed(() =>
    filtered.value.length === 0 ? 0 : Math.max(0, PAGE_SIZE - pagedRows.value.length)
  )

  // ── Helpers ───────────────────────────────────────
  const fmtPrice = (v) => Number(v).toLocaleString('vi-VN') + ' ₫'
  const fmtDate  = (v) => {
    if (!v) return '—'
    const p = v.split('-')
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v
  }
  const todayISO  = () => new Date().toISOString().split('T')[0]
  const todayDisp = () => {
    const n = new Date()
    return `${String(n.getDate()).padStart(2,'0')}/${String(n.getMonth()+1).padStart(2,'0')}/${n.getFullYear()}`
  }
  const genId = () => {
    if (!data.value.length) return 'HCF_01'
    const max = Math.max(...data.value.map(r => parseInt((r.id.match(/(\d+)$/) || [0,0])[1])))
    return 'HCF_' + String(max + 1).padStart(2, '0')
  }

  // ── Form popup ────────────────────────────────────
  const showForm  = ref(false)
  const isEditing = ref(false)
  const inputName = ref(null)
  const form = ref({ id: '', tenLoai: '', gia: '', ngayTao: '', ngayTaoDisp: '' })

  const openAdd = () => {
    isEditing.value = false
    form.value = { id: genId(), tenLoai: '', gia: '', ngayTao: todayISO(), ngayTaoDisp: todayDisp() }
    showForm.value = true
    nextTick(() => inputName.value?.focus())
  }

  const openEdit = (row) => {
    isEditing.value = true
    form.value = {
      id: row.id,
      tenLoai: row.tenLoai,
      gia: row.gia,
      ngayTao: row.ngayTao,
      ngayTaoDisp: fmtDate(row.ngayTao),
    }
    showForm.value = true
    nextTick(() => inputName.value?.focus())
  }

  const submitForm = () => {
    if (!form.value.tenLoai.trim()) return { error: 'Vui lòng nhập tên loại hạt!' }
    if (!form.value.gia)            return { error: 'Vui lòng nhập giá!' }

    if (!isEditing.value) {
      data.value.unshift({
        id: form.value.id,
        tenLoai: form.value.tenLoai.trim(),
        gia: Number(form.value.gia),
        ngayTao: form.value.ngayTao,
      })
      currentPage.value = 1
    } else {
      const idx = data.value.findIndex(r => r.id === form.value.id)
      if (idx !== -1) {
        data.value[idx] = {
          ...data.value[idx],
          tenLoai: form.value.tenLoai.trim(),
          gia: Number(form.value.gia),
        }
      }
    }
    persist()
    showForm.value = false
    return { success: isEditing.value ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!' }
  }

  // ── Confirm delete ────────────────────────────────
  const showConfirm  = ref(false)
  const deleteTarget = ref(null)

  const openConfirm = (row) => { deleteTarget.value = row; showConfirm.value = true }

  const doDelete = () => {
    data.value = data.value.filter(r => r.id !== deleteTarget.value.id)
    persist()
    showConfirm.value = false
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    return { success: 'Đã xóa sản phẩm!' }
  }

  // ── Toast ─────────────────────────────────────────
  const toastShow = ref(false)
  const toastMsg  = ref('')
  const toastType = ref('ok')
  let toastTimer

  const showToast = (msg, type = 'ok') => {
    toastMsg.value = msg; toastType.value = type; toastShow.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastShow.value = false }, 2800)
  }

  // ── ESC key ───────────────────────────────────────
  const onEsc = (e) => {
    if (e.key === 'Escape') { showForm.value = false; showConfirm.value = false }
  }
  onMounted(()   => document.addEventListener('keydown', onEsc))
  onUnmounted(() => document.removeEventListener('keydown', onEsc))

  return {
    search, currentPage, PAGE_SIZE,
    filtered, totalPages, pageStart, pagedRows, ghostCount,
    fmtPrice, fmtDate,
    showForm, isEditing, inputName, form,
    openAdd, openEdit, submitForm,
    showConfirm, deleteTarget, openConfirm, doDelete,
    toastShow, toastMsg, toastType, showToast,
  }
}