const API = '/api/promo-codes'

// Chuyển data từ backend sang format hiển thị
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
        end:      v.endDate?.split('T')[0] ?? '',
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
            id: null, code: '', name: '',
            category: 'PHẦN TRĂM', value: '',
            quantity: 1, start: '', end: '',
            status: 'HOẠT ĐỘNG'
        }
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

        // Gọi API lấy danh sách
        async loadVouchers() {
            const data = await fetch(API).then(r => r.json())
            this.vouchers = data.map(format)
            this.filteredVouchers = [...this.vouchers]
        },

        // Lọc danh sách
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

        // Xóa bộ lọc
        resetFilter() {
            this.search = ''; this.status = ''; this.type = ''
            this.fromDate = ''; this.toDate = ''
            this.filteredVouchers = [...this.vouchers]
            this.currentPage = 1
        },

        // Thêm voucher mới
        async addVoucher() {
            await fetch(`${API}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code:      'NEW' + ~~(Math.random() * 1000),
                    name:      'Voucher mới',
                    category:  'PHẦN TRĂM',
                    value:     15,
                    quantity:  1,
                    startDate: new Date().toISOString(),
                    endDate:   new Date(Date.now() + 30 * 864e5).toISOString(),
                    status:    true
                })
            })
            await this.loadVouchers()
        },

        // Xóa voucher
        async deleteVoucher(id) {
            if (!confirm('Xóa voucher này?')) return
            await fetch(`${API}/remove/${id}`, { method: 'DELETE' })
            await this.loadVouchers()
            if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
        },

        // Mở popup sửa
        editVoucher(v) {
            this.editForm = {
                id:       v.id,
                code:     v.code,
                name:     v.name,
                category: v.type,
                value:    parseFloat(v.value),
                quantity: v.quantity,
                start:    v.start,
                end:      v.end,
                status:   v.status
            }
            this.showEditModal = true
        },

        // Lưu sửa voucher
        async saveEdit() {
            const f = this.editForm
            await fetch(`${API}/update/${f.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id:        f.id,
                    code:      f.code,
                    name:      f.name,
                    category:  f.category,
                    value:     +f.value,
                    quantity:  +f.quantity,
                    startDate: f.start ? new Date(f.start).toISOString() : null,
                    endDate:   f.end   ? new Date(f.end).toISOString()   : null,
                    status:    f.status === 'HOẠT ĐỘNG'
                })
            })
            await this.loadVouchers()
            this.showEditModal = false
        },

        closeModal() { this.showEditModal = false },
        prevPage()   { this.currentPage-- },
        nextPage()   { this.currentPage++ }
    },

    mounted() { this.loadVouchers() }
}