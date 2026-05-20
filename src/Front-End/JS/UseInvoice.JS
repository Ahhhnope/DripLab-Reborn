import { ref, computed } from "vue"
import api from "../../api/axios"

const invoices = ref([])
const filteredInvoices = ref([])

const search = ref("")
const paymentFilter = ref("")
const receiveFilter = ref("")
const fromDate = ref("")
const toDate = ref("")

// Phân trang
const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() =>
  Math.ceil(filteredInvoices.value.length / pageSize.value)
)

const pagedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredInvoices.value.slice(start, start + pageSize.value)
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

function mapInvoice(inv) {
  const isOnline = inv.receiveType === 'Online'
  const items = (inv.items ?? []).map(item => {
    console.log('mapInvoice called:', inv.invoiceId, inv.items?.[0])
    const toppingList = (item.toppings ?? []).map(t => ({
      name: t.name || "",
      price: t.price || 0,
    }))
    const unitPrice = item.unitPrice || 0
    return {
      name: item.name || "Món không tên",
      qty: item.qty || 1,
      unitPrice,
      price: unitPrice,
      size: item.size || null,
      sugar: item.sugar ?? null,
      ice: item.ice ?? null,
      toppings: toppingList,

      isCustom: !!(item.beanName || item.baseName || item.milkName),
      beanName: item.beanName ?? null,
      baseName: item.baseName ?? null,
      milkName: item.milkName ?? null,
    }
  })

  return {
    invoice_id: `HD_${inv.invoiceId}`,
    order_id: inv.orderId || "N/A",
    status: inv.status || "Đã hủy",
    date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : "-",
    payment_method: inv.paymentMethod || "Chưa chọn",
    receive_type: inv.receiveType || "Tại Quầy",
    finalPrice: inv.finalPrice || 0,
    originalPrice: inv.originalPrice || 0,
    discountAmount: inv.discountAmount || 0,
    shippingFee: inv.shippingFee || 0,
    created_at: inv.createdAt,
    note: inv.note || "",
    customer: {
      id: inv.customer?.id || "N/A",
      name: inv.receiverName || inv.customer?.name || "Khách lẻ",
      phone: inv.receiverPhone || inv.customer?.phone || "-",
      email: inv.customer?.email || "-",
      address: inv.shippingAddress || inv.customer?.address || "-",
    },
    items,
  }
}

async function loadInvoices() {
  try {
    const res = await api.get("/invoices")
    const mapped = res.data.map(mapInvoice)

    console.log("Sample invoice:", res.data[0])

    mapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    invoices.value = mapped
    filteredInvoices.value = mapped
    currentPage.value = 1
  } catch (err) {
    console.error("Lỗi fetch hóa đơn:", err)
  }
}

function filterInvoice() {
  const q = search.value.toLowerCase()
  filteredInvoices.value = invoices.value.filter(inv => {
    const matchSearch = inv.invoice_id.toLowerCase().includes(q) ||
      String(inv.order_id).toLowerCase().includes(q)
    const matchPayment = !paymentFilter.value || inv.payment_method === paymentFilter.value
    const matchReceive = !receiveFilter.value || inv.receive_type === receiveFilter.value
    const matchFrom = !fromDate.value || new Date(inv.created_at) >= new Date(fromDate.value)
    const matchTo = !toDate.value || new Date(inv.created_at) <= new Date(toDate.value)
    return matchSearch && matchPayment && matchReceive && matchFrom && matchTo
  })
  currentPage.value = 1
}

function resetFilter() {
  search.value = ""
  paymentFilter.value = ""
  receiveFilter.value = ""
  fromDate.value = ""
  toDate.value = ""
  filteredInvoices.value = [...invoices.value]
  currentPage.value = 1
}

export {
  invoices, filteredInvoices, pagedInvoices,
  search, paymentFilter, receiveFilter, fromDate, toDate,
  currentPage, pageSize, totalPages,
  loadInvoices, filterInvoice, resetFilter, goToPage,
}