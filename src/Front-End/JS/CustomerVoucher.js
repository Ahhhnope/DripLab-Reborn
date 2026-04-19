import api from '../../api/axios.js'

const API = '/promo-codes'

// ── Format dữ liệu từ API → hiển thị bảng ─────────────────────
function format(v) {
    const expired = !v.status
        || v.quantity <= 0
        || new Date(v.endDate) < new Date()

    return {
        id:              v.id,
        code:            v.code,
        name:            v.name,
        type:            v.category,                          // "PHẦN TRĂM" | "TRỪ TIỀN"
        value:           v.category === 'PHẦN TRĂM'
                             ? v.value + '%'
                             : (+v.value).toLocaleString('vi-VN') + 'đ',
        quantity:        v.quantity,
        minOrderValue:   v.minOrderValue  ?? 0,
        displayLocation: v.displayLocation ?? 'trên web',
        start:           v.startDate?.split('T')[0] ?? '',
        end:             v.endDate?.split('T')[0]   ?? '',
        status:          expired ? 'HẾT HẠN' : 'HOẠT ĐỘNG'
    }
}

// ── Form trống khi thêm mới ────────────────────────────────────
const emptyAdd = () => ({
    code:            '',
    name:            '',
    category:        'PHẦN TRĂM',
    value:           '',
    quantity:        1,
    minOrderValue:   0,
    displayLocation: 'trên web',
    start:           '',
    end:             ''
})

export default {

    data: () => ({
        // Filter
        search:   '',
        status:   '',
        type:     '',
        fromDate: '',
        toDate:   '',

        // Data
        vouchers:         [],
        filteredVouchers: [],
        currentPage:      1,

        // Modal thêm
        showAddModal: false,
        addForm:      emptyAdd(),

        // Modal sửa
        showEditModal: false,
        editForm: {
            id:              null,
            code:            '',
            name:            '',
            category:        'PHẦN TRĂM',
            value:           '',
            quantity:        1,
            minOrderValue:   0,
            displayLocation: 'trên web',
            start:           '',
            end:             '',
            status:          'HOẠT ĐỘNG'
        },

        // Toast
        toast: { show: false, message: '', type: 'success' }
    }),

    computed: {
        paginatedVouchers() {
            const s = (this.currentPage - 1) * 8
            return this.filteredVouchers.slice(s, s + 8)
        },
        totalPages() {
            return Math.max(1, Math.ceil(this.filteredVouchers.length / 8))
        }
    },

    methods: {

        // ── Load ────────────────────────────────────────────────
        async loadVouchers() {
            try {
                const res = await api.get(API)
                this.vouchers         = res.data.map(format)
                this.filteredVouchers = [...this.vouchers]
            } catch (e) {
                this.showToast(
                    e.response
                        ? `Lỗi ${e.response.status}: ${e.response.data?.message || 'Không thể tải'}`
                        : 'Không thể kết nối server',
                    'error'
                )
            }
        },

        // ── Filter ──────────────────────────────────────────────
        filterVoucher() {
            this.filteredVouchers = this.vouchers.filter(v =>
                (v.code + v.name).toLowerCase().includes(this.search.toLowerCase()) &&
                (!this.status   || v.status === this.status)   &&
                (!this.type     || v.type   === this.type)     &&
                (!this.fromDate || v.start  >= this.fromDate)  &&
                (!this.toDate   || v.end    <= this.toDate)
            )
            this.currentPage = 1
        },

        resetFilter() {
            this.search = ''; this.status = ''; this.type = ''
            this.fromDate = ''; this.toDate = ''
            this.filteredVouchers = [...this.vouchers]
            this.currentPage = 1
        },

        // ── Thêm ────────────────────────────────────────────────
        openAddModal() {
            this.addForm     = emptyAdd()
            this.showAddModal = true
        },

        async saveAdd() {
            const f = this.addForm
            if (!f.code || !f.name || !f.value || !f.start || !f.end) {
                this.showToast('Vui lòng điền đầy đủ thông tin!', 'error')
                return
            }
            try {
                await api.post(API + '/add', {
                    code:            f.code.toUpperCase().trim(),
                    name:            f.name,
                    category:        f.category,
                    value:           parseFloat(f.value),
                    quantity:        parseInt(f.quantity),
                    minOrderValue:   parseFloat(f.minOrderValue)   || 0,
                    displayLocation: f.displayLocation,
                    startDate:       new Date(f.start).toISOString(),
                    endDate:         new Date(f.end).toISOString(),
                    status:          true
                })
                await this.loadVouchers()
                this.showAddModal = false
                this.showToast('Thêm voucher thành công!', 'success')
            } catch (e) {
                this.showToast('Lỗi: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        // ── Sửa ─────────────────────────────────────────────────
        editVoucher(v) {
            this.editForm = {
                id:              v.id,
                code:            v.code,
                name:            v.name,
                category:        v.type,
                value:           parseFloat(v.value),
                quantity:        v.quantity,
                minOrderValue:   v.minOrderValue,
                displayLocation: v.displayLocation,
                start:           v.start,
                end:             v.end,
                status:          v.status
            }
            this.showEditModal = true
        },

        async saveEdit() {
            const f = this.editForm
            try {
                await api.put(API + '/update/' + f.id, {
                    id:              f.id,
                    code:            f.code.toUpperCase().trim(),
                    name:            f.name,
                    category:        f.category,
                    value:           parseFloat(f.value),
                    quantity:        parseInt(f.quantity),
                    minOrderValue:   parseFloat(f.minOrderValue)   || 0,
                    displayLocation: f.displayLocation,
                    startDate:       f.start ? new Date(f.start).toISOString() : null,
                    endDate:         f.end   ? new Date(f.end).toISOString()   : null,
                    status:          f.status === 'HOẠT ĐỘNG'
                })
                await this.loadVouchers()
                this.showEditModal = false
                this.showToast('Cập nhật thành công!', 'success')
            } catch (e) {
                this.showToast('Lỗi: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        // ── Xóa ─────────────────────────────────────────────────
        async deleteVoucher(id) {
            if (!confirm('Xóa voucher này?')) return
            try {
                await api.delete(API + '/remove/' + id)
                await this.loadVouchers()
                if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
                this.showToast('Đã xóa voucher!', 'success')
            } catch (e) {
                this.showToast('Lỗi: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        // ── Pagination ──────────────────────────────────────────
        prevPage()     { this.currentPage-- },
        nextPage()     { this.currentPage++ },
        closeModal()   { this.showEditModal = false },
        closeAddModal(){ this.showAddModal  = false },

        // ── Toast ───────────────────────────────────────────────
        showToast(message, type = 'success') {
            this.toast = { show: true, message, type }
            setTimeout(() => { this.toast.show = false }, 3500)
        }
    },

    mounted() { this.loadVouchers() }
}