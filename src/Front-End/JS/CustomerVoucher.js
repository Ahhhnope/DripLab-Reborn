export default {

    data() {

        return {

            search: "",
            status: "",
            type: "",
            fromDate: "",
            toDate: "",

            vouchers: [

                {
                    id: 1,
                    code: "VOUCHER10",
                    name: "Giảm 10%",
                    type: "PHẦN TRĂM",
                    value: "10%",
                    quantity: 1,
                    start: "2025-12-25",
                    end: "2026-01-25",
                    status: "HOẠT ĐỘNG"
                },

                {
                    id: 2,
                    code: "VIP30",
                    name: "VIP giảm 30%",
                    type: "PHẦN TRĂM",
                    value: "30%",
                    quantity: 1,
                    start: "2025-12-22",
                    end: "2026-01-22",
                    status: "HOẠT ĐỘNG"
                }

            ],

            filteredVouchers: [],

            currentPage: 1,
            perPage: 5

        }

    },

    computed: {

        paginatedVouchers() {

            const start = (this.currentPage - 1) * 8
            const end = start + 8

            return this.filteredVouchers.slice(start, end);

        },

        totalPages() {

            return Math.ceil(this.filteredVouchers.length / 8)

        }

    },

    methods: {


        filterVoucher() {

            this.filteredVouchers = this.vouchers.filter(v => {

                const matchSearch =
                    v.code.toLowerCase().includes(this.search.toLowerCase()) ||
                    v.name.toLowerCase().includes(this.search.toLowerCase())

                const matchStatus =
                    !this.status || v.status === this.status

                const matchType =
                    !this.type || v.type === this.type

                const matchDate =
                    (!this.fromDate || new Date(v.start) >= new Date(this.fromDate)) &&
                    (!this.toDate || new Date(v.end) <= new Date(this.toDate))

                return matchSearch && matchStatus && matchType && matchDate

            })

            this.currentPage = 1

        },


        resetFilter() {

            this.search = ""
            this.status = ""
            this.type = ""
            this.fromDate = ""
            this.toDate = ""

            this.filteredVouchers = this.vouchers

            this.currentPage = 1

        },


        addVoucher() {

            const index = this.vouchers.length + 1

            const newVoucher = {

                id: "KM_" + String(index).padStart(2, '0'),
                code: "NEW" + Math.floor(Math.random() * 1000),
                name: "Voucher mới",
                type: "PHẦN TRĂM",
                value: "15%",
                quantity: 1,
                start: "2025-12-01",
                end: "2026-01-01",
                status: "HOẠT ĐỘNG"

            }

            this.vouchers.unshift(newVoucher)

            this.filterVoucher()

            this.currentPage = 1

        },

        deleteVoucher(id) {

            if (confirm("Bạn có chắc muốn xóa không?")) {

                const index = this.vouchers.findIndex(v => v.id === id)

                if (index !== -1) {
                    this.vouchers.splice(index, 1)
                }

                // cập nhật lại danh sách hiển thị
                this.filterVoucher()

                // fix pagination
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages || 1
                }

            }

        }

    },

    mounted() {

        this.filteredVouchers = this.vouchers

    }




}



