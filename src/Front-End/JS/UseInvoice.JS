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
    const res = await api.get("/invoices");
    
    // Transform Spring Boot Entity -> Vue Template Structure
    invoices.value = res.data.map(inv => ({
      invoice_id: `HD_${inv.id}`,
      order_id: inv.order?.id || "N/A",
      status: inv.order?.status || "Đã hủy",
      date: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('vi-VN') : "-",
      payment_method: inv.paymentMethod || "Chưa chọn",
      receive_type: inv.receiptType || "Tại quầy",
      finalPrice: inv.finalPrice || 0,
      
      // Customer box data
      customer: {
        id: inv.customer?.id || "N/A",
        name: inv.customer?.name || "Khách lẻ",
        phone: inv.customer?.phone || "-",
        email: inv.customer?.email || "-",
        address: inv.customer?.address || "-"
      },
      
      // Detail modal data
      items: inv.order?.items?.map(item => ({
        name: item.drink?.name || "Món không tên",
        price: item.basePriceAtPurchase || 0,
        qty: item.quantity,
        sugar: item.sugarLevel,
        ice: item.iceLevel
      })) || [],
      
      originalPrice: inv.originalPrice,
      discountAmount: inv.discountAmount,
      shippingFee: inv.shippingFee,
      created_at: inv.invoiceDate
    }));
    
    filteredInvoices.value = invoices.value;
  } catch (err) {
    console.error("Lỗi fetch hóa đơn:", err);
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