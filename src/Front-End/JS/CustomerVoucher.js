import api from '../../api/axios.js'

const API = '/promo-codes'

function format(v) {
    const expired = !v.status || v.quantity <= 0 || new Date(v.endDate) < new Date()
    return {
        id:       v.id,
        code:     v.code,
        name:     v.name,
        type:     v.category,
        value:    v.category === 'PHẦN TRĂM'
                    ? v.value + '%'
                    : (+v.value).toLocaleString('vi-VN') + 'đ',
        quantity: v.quantity,
        start:    v.startDate?.split('T')[0] ?? '',
        end:      v.endDate?.split('T')[0]   ?? '',
        status:   expired ? 'HẾT HẠN' : 'HOẠT ĐỘNG'
    }
}

export default {

    data: () => ({
        search: '', status: '', type: '', fromDate: '', toDate: '',
        vouchers: [],
        filteredVouchers: [],
        currentPage: 1,

        showEditModal: false,
        editForm: {
            id: null, code: '', name: '', category: 'PHẦN TRĂM',
            value: '', quantity: 1, start: '', end: '', status: 'HOẠT ĐỘNG'
        },

        showAddModal: false,
        addForm: {
            code: '', name: '', category: 'PHẦN TRĂM',
            value: '', quantity: 1, start: '', end: ''
        },

        toast: { show: false, message: '', type: 'success' }
    }),

    computed: {
        paginatedVouchers() {
            const start = (this.currentPage - 1) * 8
            return this.filteredVouchers.slice(start, start + 8)
        },
        totalPages() {
            return Math.max(1, Math.ceil(this.filteredVouchers.length / 8))
        }
    },

    methods: {

        async loadVouchers() {
            try {
                const res = await api.get(API)
                this.vouchers = res.data.map(format)
                this.filteredVouchers = [...this.vouchers]
            } catch (e) {
                const msg = e.response
                    ? 'Lỗi ' + e.response.status + ': ' + (e.response.data?.message || 'Không thể tải voucher')
                    : 'Không thể kết nối server'
                this.showToast(msg, 'error')
            }
        },

        filterVoucher() {
            this.filteredVouchers = this.vouchers.filter(v =>
                (v.code + v.name).toLowerCase().includes(this.search.toLowerCase()) &&
                (!this.status   || v.status === this.status) &&
                (!this.type     || v.type   === this.type)   &&
                (!this.fromDate || v.start  >= this.fromDate) &&
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

        addVoucher() {
            this.addForm = { code: '', name: '', category: 'PHẦN TRĂM', value: '', quantity: 1, start: '', end: '' }
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
                    code:      f.code.toUpperCase().trim(),
                    name:      f.name,
                    category:  f.category,
                    value:     parseFloat(f.value),
                    quantity:  parseInt(f.quantity),
                    startDate: f.start ? new Date(f.start).toISOString() : null,
                    endDate:   f.end   ? new Date(f.end).toISOString()   : null,
                    status:    true
                })
                await this.loadVouchers()
                this.showAddModal = false
                this.showToast('Thêm voucher thành công!', 'success')
            } catch (e) {
                this.showToast('Lỗi khi thêm: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        async deleteVoucher(id) {
            if (!confirm('Xóa voucher này?')) return
            try {
                await api.delete(API + '/remove/' + id)
                await this.loadVouchers()
                if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
                this.showToast('Đã xóa voucher!', 'success')
            } catch (e) {
                this.showToast('Lỗi khi xóa: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        editVoucher(v) {
            this.editForm = {
                id: v.id, code: v.code, name: v.name, category: v.type,
                value: parseFloat(v.value), quantity: v.quantity,
                start: v.start, end: v.end, status: v.status
            }
            this.showEditModal = true
        },

        async saveEdit() {
            const f = this.editForm
            try {
                await api.put(API + '/update/' + f.id, {
                    id: f.id, code: f.code, name: f.name, category: f.category,
                    value: parseFloat(f.value), quantity: parseInt(f.quantity),
                    startDate: f.start ? new Date(f.start).toISOString() : null,
                    endDate:   f.end   ? new Date(f.end).toISOString()   : null,
                    status: f.status === 'HOẠT ĐỘNG'
                })
                await this.loadVouchers()
                this.showEditModal = false
                this.showToast('Cập nhật thành công!', 'success')
            } catch (e) {
                this.showToast('Lỗi khi cập nhật: ' + (e.response?.data?.message || e.message), 'error')
            }
        },

        closeModal()    { this.showEditModal = false },
        closeAddModal() { this.showAddModal  = false },
        prevPage()      { this.currentPage-- },
        nextPage()      { this.currentPage++ },

        showToast(message, type = 'success') {
            this.toast = { show: true, message, type }
            setTimeout(() => { this.toast.show = false }, 3500)
        }
    },

    mounted() { this.loadVouchers() }
}