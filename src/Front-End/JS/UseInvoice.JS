import { ref } from "vue"
import api from "../../api/axios"

const invoices         = ref([])
const filteredInvoices = ref([])

const search        = ref("")
const paymentFilter = ref("")
const receiveFilter = ref("")
const fromDate      = ref("")
const toDate        = ref("")

async function loadInvoices() {
  try {
    const res = await api.get("/invoices")
    invoices.value         = res.data
    filteredInvoices.value = res.data
  } catch (err) {
    console.warn("Không kết nối được backend, dùng data mẫu")
    const sample = [
  {
    invoice_id: "HD_01", order_id: "719523347", date: "2026-03-20",
    payment_method: "Tiền mặt",
    receive_type: "Tại Quầy",
    status: "Đã giao",
    final_price: 45000,
    customer: { id: "KH_01", name: "Nguyễn Văn A", phone: "0988888888", email: "a@gmail.com", address: "Hà Nội" },
    items: [
      { name: "Cà phê sữa",       qty: 1, sugar: 75,  ice: 50 },
      { name: "Topping trân châu", qty: 1, sugar: 100, ice: 100 }
    ],
    original_price: 50000, discount: 5000, shipping: 0, created_at: "20/03/2026 13:38"
  },
  {
    invoice_id: "HD_02", order_id: "719523346", date: "2026-03-21",
    payment_method: "Chuyển khoản",
    receive_type: "Online",
    status: "Đang giao",
    final_price: 65000,
    customer: { id: "KH_02", name: "Trần Văn B", phone: "0977777777", email: "b@gmail.com", address: "Hồ Chí Minh" },
    items: [
      { name: "Cold Brew",  qty: 1, sugar: 50, ice: 100 },
      { name: "Kem cheese", qty: 1, sugar: 75, ice: 75  }
    ],
    original_price: 70000, discount: 5000, shipping: 0, created_at: "21/03/2026 09:20"
  }
]
    invoices.value         = sample
    filteredInvoices.value = sample
  }
}

function filterInvoice() {
  const q = search.value.toLowerCase()
  filteredInvoices.value = invoices.value.filter(inv => {
    const matchSearch  = inv.invoice_id.toLowerCase().includes(q) ||
                         inv.order_id.toLowerCase().includes(q)
    const matchPayment = !paymentFilter.value || inv.payment_method === paymentFilter.value
    const matchReceive = !receiveFilter.value || inv.receive_type === receiveFilter.value // ✅
    const matchFrom    = !fromDate.value || new Date(inv.date) >= new Date(fromDate.value)
    const matchTo      = !toDate.value   || new Date(inv.date) <= new Date(toDate.value)
    return matchSearch && matchPayment && matchReceive && matchFrom && matchTo
  })
}

function resetFilter() {
  search.value        = ""
  paymentFilter.value = ""
  receiveFilter.value = ""
  fromDate.value      = ""
  toDate.value        = ""
  filteredInvoices.value = [...invoices.value]
}

export {
  invoices,
  filteredInvoices,
  search,
  paymentFilter,
  receiveFilter,
  fromDate,
  toDate,
  loadInvoices,
  filterInvoice,
  resetFilter
}