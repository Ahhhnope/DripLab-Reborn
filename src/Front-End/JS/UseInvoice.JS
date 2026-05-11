import { ref } from "vue"
import api from "../../api/axios"

const invoices = ref([])
const filteredInvoices = ref([])

const search = ref("")
const paymentFilter = ref("")
const receiveFilter = ref("")
const fromDate = ref("")
const toDate = ref("")

async function loadInvoices() {
  try {
    const res = await api.get("/invoices");
    console.log(res.data);

    invoices.value = res.data.map(inv => {
      if (inv.receiveType === 'Online') {
        return ({
          // ✅ Fix: DTO trả về invoiceId, không phải id
          invoice_id: `HD_${inv.invoiceId}`,
          // ✅ Fix: DTO trả về orderId trực tiếp
          order_id: inv.orderId || "N/A",
          // ✅ Fix: DTO trả về status trực tiếp
          status: inv.status || "Đã hủy",
          // ✅ Fix: DTO trả về createdAt
          date: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString('vi-VN')
            : "-",
          payment_method: inv.paymentMethod || "Chưa chọn",
          // ✅ Fix: DTO trả về receiveType
          receive_type: inv.receiveType || "Tại Quầy",
          finalPrice: inv.finalPrice || 0,
          originalPrice: inv.originalPrice || 0,
          discountAmount: inv.discountAmount || 0,
          shippingFee: inv.shippingFee || 0,
          created_at: inv.createdAt,
          note: inv.note || "",

          // ✅ Fix: DTO trả về customer.name (không phải fullName)
          customer: {
            id: inv.customer?.id || "N/A",
            name: inv.customer?.name || "Khách lẻ",
            phone: inv.customer?.phone || "-",
            email: inv.customer?.email || "-",
            address: inv.customer?.address || "-",
          },

          // ✅ Fix: DTO trả về items trực tiếp (không lồng trong order)
          items: (inv.items ?? []).map(item => {
            const toppingList = (item.toppings ?? []).map(t => ({
              name: t.name || "",
              price: t.price || 0,
            }))

            const toppingTotal = toppingList.reduce((s, t) => s + t.price, 0)
            // unitPrice từ DTO đã bao gồm basePriceAtPurchase
            const unitPrice = (item.unitPrice || 0) + toppingTotal

            return {
              name: item.name || "Món không tên",
              qty: item.qty || 1,
              unitPrice: unitPrice,
              price: unitPrice,
              size: item.size || null,
              sugar: item.sugar ?? null,
              ice: item.ice ?? null,
              toppings: toppingList,
            }
          }),
        })
      } else {
        return ({
          // ✅ Fix: DTO trả về invoiceId, không phải id
          invoice_id: `HD_${inv.invoiceId}`,
          // ✅ Fix: DTO trả về orderId trực tiếp
          order_id: inv.orderId || "N/A",
          // ✅ Fix: DTO trả về status trực tiếp
          status: inv.status || "Đã hủy",
          // ✅ Fix: DTO trả về createdAt
          date: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString('vi-VN')
            : "-",
          payment_method: inv.paymentMethod || "Chưa chọn",
          // ✅ Fix: DTO trả về receiveType
          receive_type: inv.receiveType || "Tại Quầy",
          finalPrice: inv.finalPrice || 0,
          originalPrice: inv.originalPrice || 0,
          discountAmount: inv.discountAmount || 0,
          shippingFee: inv.shippingFee || 0,
          created_at: inv.createdAt,
          note: inv.note || "",

          // Receiver hybrid bs
          customer: {
            id: inv.customer?.id || "N/A",
            name: inv.receiverName || "Khách lẻ",
            phone: inv.receiverPhone || "-",
            email: "-",
            address: inv.customer?.address || "-",
          },

          // ✅ Fix: DTO trả về items trực tiếp (không lồng trong order)
          items: (inv.items ?? []).map(item => {
            const toppingList = (item.toppings ?? []).map(t => ({
              name: t.name || "",
              price: t.price || 0,
            }))

            const toppingTotal = toppingList.reduce((s, t) => s + t.price, 0)
            // unitPrice từ DTO đã bao gồm basePriceAtPurchase
            const unitPrice = (item.unitPrice || 0) + toppingTotal

            return {
              name: item.name || "Món không tên",
              qty: item.qty || 1,
              unitPrice: unitPrice,
              price: unitPrice,
              size: item.size || null,
              sugar: item.sugar ?? null,
              ice: item.ice ?? null,
              toppings: toppingList,
            }
          }),
        })
      }
    })

    filteredInvoices.value = invoices.value
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
    const matchFrom = !fromDate.value || new Date(inv.date) >= new Date(fromDate.value)
    const matchTo = !toDate.value || new Date(inv.date) <= new Date(toDate.value)
    return matchSearch && matchPayment && matchReceive && matchFrom && matchTo
  })
}

function resetFilter() {
  search.value = ""
  paymentFilter.value = ""
  receiveFilter.value = ""
  fromDate.value = ""
  toDate.value = ""
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
  resetFilter,
}