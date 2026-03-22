<template>
    <div>

        <!-- HEADER -->
        <div class="hdr">
            <div class="hdr-icon">☕</div>
            <div>
                <h1>Hạt Cà Phê</h1>
                <p>Quản lý danh mục sản phẩm</p>
            </div>
        </div>

        <!-- TOOLBAR -->
        <div class="toolbar">
            <div class="search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7b82a3" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input v-model="search" @input="currentPage = 1" placeholder="Tìm tên loại hạt..." />
            </div>
            <button class="btn-add" @click="openAdd">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Thêm mới
            </button>
        </div>

        <!-- TABLE -->
        <div class="card">
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
                        <tr v-for="g in PAGE_SIZE" :key="'eg' + g" class="ghost">
                            <td colspan="6"></td>
                        </tr>
                    </template>

                    <template v-else>
                        <tr v-for="(row, i) in pagedRows" :key="row.id">
                            <td>{{ pageStart + i + 1 }}</td>
                            <td><span class="bid">{{ row.id }}</span></td>
                            <td>{{ row.tenLoai }}</td>
                            <td class="price">{{ fmtPrice(row.gia) }}</td>
                            <td class="dt">{{ fmtDate(row.ngayTao) }}</td>
                            <td>
                                <div class="acts">
                                    <button class="be" title="Sửa" @click="openEdit(row)">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button class="bd" title="Xóa" @click="openConfirm(row)">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-for="g in ghostCount" :key="'g' + g" class="ghost">
                            <td colspan="6"></td>
                        </tr>
                    </template>

                </tbody>
            </table>
        </div>

        <!-- PAGINATION -->
        <div class="pgbar">
            <div class="pginfo" v-if="filtered.length > 0">
                Hiển thị {{ pageStart + 1 }}–{{ Math.min(pageStart + PAGE_SIZE, filtered.length) }} / {{ filtered.length
                }} mục
            </div>
            <div class="pgctrl" v-if="totalPages > 1">
                <button class="pb" :disabled="currentPage === 1" @click="currentPage--">&#8249;</button>
                <button v-for="p in totalPages" :key="p" class="pb" :class="{ on: p === currentPage }"
                    @click="currentPage = p">{{ p }}</button>
                <button class="pb" :disabled="currentPage === totalPages" @click="currentPage++">&#8250;</button>
            </div>
        </div>

        <!-- FORM MODAL -->
        <div class="ov" :class="{ show: showForm }" @click.self="showForm = false">
            <div class="modal">
                <div class="mhdr">
                    <div class="mtitle">
                        <div class="dot"></div>
                        <span>{{ isEditing ? 'Chỉnh sửa hạt cà phê' : 'Thêm hạt cà phê' }}</span>
                    </div>
                    <button class="xbtn" @click="showForm = false">✕</button>
                </div>
                <div class="fgrid">
                    <div class="fg">
                        <label>Mã ID <em>(tự động)</em></label>
                        <input :value="form.id" readonly />
                    </div>
                    <div class="fg">
                        <label>Ngày tạo <em>(tự động)</em></label>
                        <input :value="form.ngayTaoDisp" readonly />
                    </div>
                    <div class="fg full">
                        <label>Tên loại hạt</label>
                        <input ref="inputName" v-model="form.tenLoai" placeholder="VD: Arabica, Robusta..."
                            @keyup.enter="submitForm" />
                    </div>
                    <div class="fg full">
                        <label>Giá (VNĐ)</label>
                        <input v-model="form.gia" type="number" placeholder="VD: 50000" min="0"
                            @keyup.enter="submitForm" />
                    </div>
                </div>
                <div class="factions">
                    <button class="bcnl" @click="showForm = false">Hủy</button>
                    <button class="bsub" @click="submitForm">
                        {{ isEditing ? 'Cập nhật' : 'Lưu sản phẩm' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- CONFIRM DELETE MODAL -->
        <div class="ov" :class="{ show: showConfirm }" @click.self="showConfirm = false">
            <div class="cfm">
                <div class="cicon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" stroke-width="2.2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                </div>
                <div class="ctitle">Xác nhận xóa</div>
                <div class="cmsg">
                    Bạn có chắc muốn xóa sản phẩm<br>
                    <strong>{{ deleteTarget?.tenLoai }}</strong>?<br>
                    Hành động này không thể hoàn tác.
                </div>
                <div class="cacts">
                    <button class="bccnl" @click="showConfirm = false">Hủy</button>
                    <button class="bcdel" @click="doDelete">Xóa</button>
                </div>
            </div>
        </div>

        <!-- TOAST -->
        <div class="toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>

    </div>
</template>

<script setup>
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

// Data
let init = []
try { init = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch (e) {}
if (!init.length) init = JSON.parse(JSON.stringify(SEED))
const data = ref(init)
const persist = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value)) } catch (e) {}
}

// Search & Pagination
const search      = ref('')
const currentPage = ref(1)
const filtered    = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? data.value.filter(r => r.tenLoai.toLowerCase().includes(q)) : data.value
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageStart  = computed(() => (currentPage.value - 1) * PAGE_SIZE)
const pagedRows  = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))
const ghostCount = computed(() =>
  filtered.value.length === 0 ? 0 : Math.max(0, PAGE_SIZE - pagedRows.value.length)
)

// Helpers
const fmtPrice  = (v) => Number(v).toLocaleString('vi-VN') + ' ₫'
const fmtDate   = (v) => { if (!v) return '—'; const p = v.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v }
const todayISO  = () => new Date().toISOString().split('T')[0]
const todayDisp = () => { const n = new Date(); return `${String(n.getDate()).padStart(2,'0')}/${String(n.getMonth()+1).padStart(2,'0')}/${n.getFullYear()}` }
const genId     = () => {
  if (!data.value.length) return 'HCF_01'
  const max = Math.max(...data.value.map(r => parseInt((r.id.match(/(\d+)$/) || [0,0])[1])))
  return 'HCF_' + String(max + 1).padStart(2, '0')
}

// Form modal
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
  form.value = { id: row.id, tenLoai: row.tenLoai, gia: row.gia, ngayTao: row.ngayTao, ngayTaoDisp: fmtDate(row.ngayTao) }
  showForm.value = true
  nextTick(() => inputName.value?.focus())
}
const submitForm = () => {
  if (!form.value.tenLoai.trim()) { showToast('Vui lòng nhập tên loại hạt!', 'err'); return }
  if (!form.value.gia)            { showToast('Vui lòng nhập giá!', 'err'); return }
  if (!isEditing.value) {
    data.value.unshift({ id: form.value.id, tenLoai: form.value.tenLoai.trim(), gia: Number(form.value.gia), ngayTao: form.value.ngayTao })
    currentPage.value = 1
    showToast('✅ Thêm sản phẩm thành công!', 'ok')
  } else {
    const idx = data.value.findIndex(r => r.id === form.value.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], tenLoai: form.value.tenLoai.trim(), gia: Number(form.value.gia) }
    showToast('✅ Cập nhật thành công!', 'ok')
  }
  persist()
  showForm.value = false
}

// Delete
const showConfirm  = ref(false)
const deleteTarget = ref(null)
const openConfirm  = (row) => { deleteTarget.value = row; showConfirm.value = true }
const doDelete = () => {
  data.value = data.value.filter(r => r.id !== deleteTarget.value.id)
  persist()
  showConfirm.value = false
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  showToast('🗑 Đã xóa sản phẩm!', 'ok')
}

// Toast
const toastShow = ref(false)
const toastMsg  = ref('')
const toastType = ref('ok')
let toastTimer
const showToast = (msg, type = 'ok') => {
  toastMsg.value = msg; toastType.value = type; toastShow.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastShow.value = false }, 2800)
}

// ESC
const onEsc = (e) => { if (e.key === 'Escape') { showForm.value = false; showConfirm.value = false } }
onMounted(()   => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))
</script>
<style src="../CSS/QLHatCF.CSS"></style>