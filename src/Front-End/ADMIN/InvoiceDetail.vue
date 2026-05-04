<template>
  <teleport to="body">
    <transition name="fade">
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
            <div class="flex items-baseline gap-3">
              <div class="text-lg font-black text-[#3C2A21]">
                {{ invoice.invoice_id }}
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusClass]">
                {{ invoice.status || 'Đã hủy' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- ✅ Nút In hóa đơn -->
              <button
                class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-[#634832] hover:bg-[#3C2A21] transition-colors disabled:opacity-60"
                :disabled="isPrinting"
                @click="printInvoice"
              >
                <svg v-if="!isPrinting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <svg v-else class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ isPrinting ? 'Đang xuất...' : 'In hóa đơn' }}
              </button>

              <button
                class="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
                @click="$emit('close')"
              >✕</button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <!-- ✅ Vùng nội dung sẽ được chụp thành PDF -->
            <div ref="invoiceRef" class="grid grid-cols-1 gap-6 lg:grid-cols-12">

              <!-- LEFT: Chi tiết đơn + Khách hàng -->
              <div class="lg:col-span-8 space-y-6">

                <!-- Thông tin chung -->
                <div class="rounded-xl border border-stone-100 bg-stone-50/50 p-5">
                  <div class="grid grid-cols-12 gap-y-2 gap-x-4">
                    <div class="col-span-4 text-sm text-stone-400">Mã đơn hàng</div>
                    <div class="col-span-8 text-sm font-bold text-[#3C2A21]">{{ invoice.order_id }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Thời gian đặt</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.created_at }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Thanh toán</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.payment_method }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Hình thức nhận</div>
                    <div class="col-span-8 text-sm font-medium">
                      <span :class="['rounded-full px-2 py-0.5 text-xs font-semibold',
                        invoice.receive_type === 'Online'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700']">
                        {{ invoice.receive_type }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Thông tin khách hàng -->
                <div class="rounded-xl border border-stone-100 bg-stone-50/50 p-5">
                  <h4 class="font-bold text-stone-800 border-b pb-2 mb-3">Thông tin khách hàng</h4>
                  <div class="grid grid-cols-12 gap-y-2 gap-x-4">
                    <div class="col-span-4 text-sm text-stone-400">Mã KH</div>
                    <div class="col-span-8 text-sm font-bold text-[#3C2A21]">{{ invoice.customer?.id || '—' }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Tên</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.customer?.name || '—' }}</div>

                    <div class="col-span-4 text-sm text-stone-400">SĐT</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.customer?.phone || '—' }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Email</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.customer?.email || '—' }}</div>

                    <div class="col-span-4 text-sm text-stone-400">Địa chỉ</div>
                    <div class="col-span-8 text-sm font-medium">{{ invoice.customer?.address || '—' }}</div>
                  </div>
                </div>

                <!-- Chi tiết món -->
                <div class="space-y-3">
                  <h4 class="font-bold text-stone-800 border-b pb-2">Chi tiết món</h4>
                  <div
                    v-for="(item, i) in invoice.items" :key="i"
                    class="grid grid-cols-12 gap-4 items-start border-b border-dashed border-stone-100 pb-3 last:border-0"
                  >
                    <div class="col-span-8">
                      <div class="font-bold text-stone-800">{{ item.name }}</div>
                      <div v-if="item.sugar != null || item.ice != null" class="mt-1.5 flex flex-wrap gap-1">
                        <span v-if="item.sugar != null"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style="background:rgba(251,191,36,0.12);color:#d97706;border:1px solid rgba(251,191,36,0.25)">
                          🍬 Đường: {{ item.sugar }}%
                        </span>
                        <span v-if="item.ice != null"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style="background:rgba(59,130,246,0.08);color:#2563eb;border:1px solid rgba(59,130,246,0.15)">
                          🧊 Đá: {{ item.ice }}%
                        </span>
                      </div>
                    </div>
                    <div class="col-span-1 text-center font-bold text-stone-400">x{{ item.qty }}</div>
                    <div class="col-span-3 text-right font-bold text-[#3C2A21]">
                      {{ (item.price * item.qty).toLocaleString('vi-VN') }} đ
                    </div>
                  </div>

                  <div v-if="!invoice.items?.length" class="text-center text-stone-400 text-sm py-4">
                    Không có món nào
                  </div>
                </div>

              </div>

              <!-- RIGHT: Tổng tiền -->
              <div class="lg:col-span-4 space-y-4">
                <div class="rounded-xl bg-[#FAF7F2] p-5 space-y-3 sticky top-0">
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Tổng gốc</span>
                    <span class="font-bold">{{ (invoice.originalPrice || 0).toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="flex justify-between text-sm text-red-500">
                    <span>Giảm giá</span>
                    <span class="font-bold">- {{ (invoice.discountAmount || 0).toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Phí ship</span>
                    <span class="font-bold">{{ (invoice.shippingFee || 0).toLocaleString('vi-VN') }} đ</span>
                  </div>
                  <div class="pt-3 border-t border-stone-200 flex justify-between">
                    <span class="font-bold">Thành tiền</span>
                    <span class="text-lg font-black text-[#634832]">
                      {{ (invoice.finalPrice || 0).toLocaleString('vi-VN') }} đ
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ invoice: Object })
defineEmits(['close'])

const invoiceRef = ref(null)
const isPrinting = ref(false)

const statusClass = computed(() => {
  const s = props.invoice.status || 'Đã hủy'
  if (s === 'Đã giao')   return 'bg-green-100 text-green-700'
  if (s === 'Đang giao') return 'bg-blue-100 text-blue-700'
  if (s === 'Đã hủy')    return 'bg-red-100 text-red-600'
  return 'bg-orange-100 text-orange-700'
})

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function printInvoice() {
  if (isPrinting.value) return
  isPrinting.value = true

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')

    const inv = props.invoice

    const statusBg    = inv.status === 'Đã giao' ? '#dcfce7' : inv.status === 'Đang giao' ? '#dbeafe' : inv.status === 'Đã hủy' ? '#fee2e2' : '#ffedd5'
    const statusColor = inv.status === 'Đã giao' ? '#15803d' : inv.status === 'Đang giao' ? '#1d4ed8'  : inv.status === 'Đã hủy' ? '#dc2626'  : '#c2410c'
    const receiveTypeBg    = inv.receive_type === 'Online' ? '#dbeafe' : '#dcfce7'
    const receiveTypeColor = inv.receive_type === 'Online' ? '#1d4ed8' : '#15803d'

    const itemsHTML = (inv.items || []).map(item => `
      <tr>
        <td class="item-name">
          <div>${item.name}</div>
          ${(item.sugar != null || item.ice != null) ? `
          <div class="tags">
            ${item.sugar != null ? `<span class="tag-sugar">Đường ${item.sugar}%</span>` : ''}
            ${item.ice   != null ? `<span class="tag-ice">Đá ${item.ice}%</span>` : ''}
          </div>` : ''}
        </td>
        <td class="item-qty">x${item.qty}</td>
        <td class="item-price">${(item.price * item.qty).toLocaleString('vi-VN')} đ</td>
      </tr>`).join('')

    const showCustomer = inv.customer?.name && inv.customer.name !== 'Khách lẻ'

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#fff; font-family:'DM Sans',sans-serif; color:#1a1a1a; }

  #invoice { width:595px; background:#fff; }

  .top-bar { height:3px; background:#1a1a1a; width:595px; }

  /* HEADER */
  .header { display:flex; justify-content:space-between; align-items:center; padding:22px 30px; border-bottom:1px solid #e8e8e8; }
  .header-left img { height:42px; object-fit:contain; display:block; max-width:160px; }
  .header-right { text-align:right; }
  .header-right .title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; letter-spacing:1px; }
  .header-right .inv-id { font-size:12px; color:#555; margin-top:2px; }
  .status-badge { display:inline-block; font-size:10px; font-weight:600; padding:3px 10px; border-radius:4px; margin-top:5px; background:${statusBg}; color:${statusColor}; }

  /* META */
  .meta { display:flex; background:#f9f9f9; border-bottom:1px solid #e8e8e8; }
  .meta-cell { flex:1; padding:11px 14px; border-right:1px solid #e8e8e8; min-width:0; }
  .meta-cell:first-child { padding-left:30px; }
  .meta-cell:last-child { border-right:none; padding-right:30px; }
  .meta-label { font-size:8px; letter-spacing:2px; text-transform:uppercase; color:#999; white-space:nowrap; }
  .meta-value { font-size:12px; font-weight:500; color:#1a1a1a; margin-top:3px; word-break:break-word; }
  .receive-badge { display:inline-block; font-size:10px; font-weight:600; padding:2px 8px; border-radius:3px; background:${receiveTypeBg}; color:${receiveTypeColor}; }

  /* CUSTOMER */
  .customer { display:flex; gap:28px; padding:12px 30px; border-bottom:1px solid #e8e8e8; }
  .cust-label { font-size:8px; letter-spacing:2px; text-transform:uppercase; color:#999; }
  .cust-value { font-size:13px; font-weight:500; color:#1a1a1a; margin-top:2px; }

  /* ITEMS */
  .items-wrap { padding:18px 30px 0; }
  .section-label { font-size:8px; letter-spacing:2px; text-transform:uppercase; color:#999; margin-bottom:8px; }
  table.items { width:100%; border-collapse:collapse; }
  table.items thead tr { border-top:2px solid #1a1a1a; border-bottom:1px solid #1a1a1a; }
  table.items th { padding:6px 0; font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:#1a1a1a; }
  table.items th.col-name { text-align:left; }
  table.items th.col-qty  { text-align:center; width:46px; }
  table.items th.col-price{ text-align:right;  width:110px; }
  .item-name { padding:9px 0; font-size:13px; font-weight:500; border-bottom:1px dashed #e8e8e8; vertical-align:top; }
  .item-qty  { padding:9px 0; font-size:12px; color:#888; text-align:center; border-bottom:1px dashed #e8e8e8; vertical-align:top; }
  .item-price{ padding:9px 0; font-size:13px; font-weight:600; text-align:right; border-bottom:1px dashed #e8e8e8; vertical-align:top; white-space:nowrap; }
  .tags { display:flex; gap:5px; margin-top:3px; flex-wrap:wrap; }
  .tag-sugar { font-size:9px; color:#92400e; background:#fef3c7; padding:1px 6px; border-radius:3px; }
  .tag-ice   { font-size:9px; color:#1d4ed8; background:#eff6ff; padding:1px 6px; border-radius:3px; }

  /* TOTALS */
  .totals-wrap { padding:12px 30px 0; display:flex; justify-content:flex-end; }
  .totals-table { width:250px; border-collapse:collapse; }
  .totals-table td { padding:5px 0; font-size:12px; }
  .totals-table .t-label { color:#666; }
  .totals-table .t-value { text-align:right; font-weight:500; white-space:nowrap; }
  .totals-table .t-discount { color:#dc2626; }
  .totals-table .t-final td { border-top:2px solid #1a1a1a; padding-top:9px; }
  .totals-table .t-final .t-label { font-size:13px; font-weight:700; color:#1a1a1a; }
  .totals-table .t-final .t-value { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; }

  /* FOOTER */
  .footer { display:flex; justify-content:space-between; align-items:center; margin:16px 30px 0; padding:12px 0; border-top:1px solid #e8e8e8; }
  .footer-left { font-size:10px; color:#bbb; }
  .footer-right { font-family:'Playfair Display',serif; font-size:12px; color:#555; font-style:italic; }

  .bot-bar { height:3px; background:#1a1a1a; width:595px; margin-top:16px; }
</style>
</head>
<body>
<div id="invoice">

  <div class="top-bar"></div>

  <div class="header">
    <div class="header-left">
      <img src="../IMG/DripLab_Logo.png"
        onerror="this.style.display='none';document.getElementById('logo-fb').style.display='block';" />
      <div id="logo-fb" style="display:none;font-family:'Playfair Display',serif;font-size:20px;font-weight:900;letter-spacing:4px;">DRIPLAB</div>
    </div>
    <div class="header-right">
      <div class="title">HÓA ĐƠN</div>
      <div class="inv-id">${inv.invoice_id || ''}</div>
      <div><span class="status-badge">${inv.status || 'Đã hủy'}</span></div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-cell">
      <div class="meta-label">Mã đơn</div>
      <div class="meta-value">${inv.order_id || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Thời gian đặt</div>
      <div class="meta-value">${inv.created_at || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Thanh toán</div>
      <div class="meta-value">${inv.payment_method || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Hình thức</div>
      <div class="meta-value"><span class="receive-badge">${inv.receive_type || '—'}</span></div>
    </div>
  </div>

  ${showCustomer ? `
  <div class="customer">
    <div>
      <div class="cust-label">Khách hàng</div>
      <div class="cust-value">${inv.customer.name}</div>
    </div>
    ${inv.customer?.phone ? `<div><div class="cust-label">SĐT</div><div class="cust-value">${inv.customer.phone}</div></div>` : ''}
    ${inv.customer?.email && inv.customer.email !== '-' ? `<div><div class="cust-label">Email</div><div class="cust-value">${inv.customer.email}</div></div>` : ''}
  </div>` : ''}

  <div class="items-wrap">
    <div class="section-label">Chi tiết món</div>
    <table class="items">
      <thead>
        <tr>
          <th class="col-name">Tên món</th>
          <th class="col-qty">SL</th>
          <th class="col-price">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <table class="totals-table">
      <tr><td class="t-label">Tổng gốc</td><td class="t-value">${(inv.originalPrice||0).toLocaleString('vi-VN')} đ</td></tr>
      ${inv.discountAmount ? `<tr><td class="t-label">Giảm giá</td><td class="t-value t-discount">- ${inv.discountAmount.toLocaleString('vi-VN')} đ</td></tr>` : ''}
      ${inv.shippingFee    ? `<tr><td class="t-label">Phí ship</td><td class="t-value">${inv.shippingFee.toLocaleString('vi-VN')} đ</td></tr>` : ''}
      <tr class="t-final"><td class="t-label">THÀNH TIỀN</td><td class="t-value">${(inv.finalPrice||0).toLocaleString('vi-VN')} đ</td></tr>
    </table>
  </div>

  <div class="footer">
    <div class="footer-left">DripLab &copy; ${new Date().getFullYear()}</div>
    <div class="footer-right">Cam on ban da ghe DripLab</div>
  </div>

  <div class="bot-bar"></div>

</div>
</body>
</html>`

    // Tạo iframe ẩn, inject toàn bộ html document
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:595px;height:842px;border:none;opacity:0;pointer-events:none;'
    document.body.appendChild(iframe)

    iframe.contentDocument.open()
    iframe.contentDocument.write(html)
    iframe.contentDocument.close()

    // Chờ fonts + layout
    await new Promise(r => setTimeout(r, 1200))

    const invoiceEl = iframe.contentDocument.getElementById('invoice')
    const invoiceHeight = invoiceEl.scrollHeight
    iframe.style.height = invoiceHeight + 'px'

    // Chụp bằng html2canvas trong context của iframe
    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 595,
      height: invoiceHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 595,
      windowHeight: invoiceHeight,
    })

    document.body.removeChild(iframe)

    // Xuất PDF từ canvas
    const { jsPDF } = window.jspdf
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pdfWidth  = pdf.internal.pageSize.getWidth()   // 595pt
    const pdfHeight = pdf.internal.pageSize.getHeight()  // 842pt

    const imgW = pdfWidth
    const imgH = (canvas.height * imgW) / canvas.width

    let y = 0
    let first = true
    while (y < imgH) {
      if (!first) pdf.addPage()
      first = false

      // Tạo slice canvas cho từng trang
      const sliceCanvasPx = Math.min(pdfHeight, imgH - y) * canvas.width / imgW
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width  = canvas.width
      sliceCanvas.height = Math.ceil(sliceCanvasPx)
      sliceCanvas.getContext('2d').drawImage(
        canvas,
        0, Math.round(y * canvas.width / imgW),
        canvas.width, sliceCanvas.height,
        0, 0,
        canvas.width, sliceCanvas.height
      )

      const sliceH = (sliceCanvas.height * imgW) / canvas.width
      pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, imgW, sliceH)
      y += pdfHeight
    }

    pdf.save(`hoadon_${inv.invoice_id || 'export'}.pdf`)

  } catch (err) {
    console.error('Lỗi xuất PDF:', err)
    alert('Xuất PDF thất bại: ' + err.message)
  } finally {
    isPrinting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
</style>