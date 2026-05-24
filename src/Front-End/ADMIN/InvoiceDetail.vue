<template>
  <teleport to="body">
    <transition name="fade">
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
        @click.self="$emit('close')"
      >
        <div
          class="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3"
          >
            <div class="flex items-baseline gap-3">
              <div class="text-lg font-black text-[#3C2A21]">
                {{ invoice.invoice_id }}
              </div>
              <span
                :class="[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  statusClass,
                ]"
              >
                {{ invoice.status || "Đã hủy" }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Nút In hóa đơn -->
              <button
                class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-[#634832] hover:bg-[#3C2A21] transition-colors disabled:opacity-60"
                :disabled="isPrinting"
                @click="printInvoice"
              >
                <svg
                  v-if="!isPrinting"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {{ isPrinting ? "Đang xuất..." : "In hóa đơn" }}
              </button>

              <button
                class="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
                @click="$emit('close')"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <div
              ref="invoiceRef"
              class="grid grid-cols-1 gap-6 lg:grid-cols-12"
            >
              <!-- LEFT: Chi tiết đơn + Khách hàng -->
              <div class="lg:col-span-8 space-y-6">
                <!-- Thông tin chung -->
                <div
                  class="rounded-xl border border-stone-100 bg-stone-50/50 p-5"
                >
                  <div class="grid grid-cols-12 gap-y-2 gap-x-4">
                    <div class="col-span-4 text-sm text-stone-400">
                      Mã đơn hàng
                    </div>
                    <div class="col-span-8 text-sm font-bold text-[#3C2A21]">
                      {{ invoice.order_id }}
                    </div>

                    <div class="col-span-4 text-sm text-stone-400">
                      Thời gian đặt
                    </div>
                    <div class="col-span-8 text-sm font-medium">
                      {{ invoice.created_at }}
                    </div>

                    <div class="col-span-4 text-sm text-stone-400">
                      Thanh toán
                    </div>
                    <div class="col-span-8 text-sm font-medium">
                      {{ invoice.payment_method }}
                    </div>

                    <div class="col-span-4 text-sm text-stone-400">
                      Hình thức nhận
                    </div>
                    <div class="col-span-8 text-sm font-medium">
                      <span
                        :class="[
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          invoice.receive_type === 'Online'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700',
                        ]"
                      >
                        {{ invoice.receive_type }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Thông tin khách hàng -->
                <div
                  class="rounded-xl border border-stone-100 bg-stone-50/50 p-5"
                >
                  <h4 class="font-bold text-stone-800 border-b pb-2 mb-3">
                    Thông tin khách hàng
                  </h4>
                  <div class="grid grid-cols-12 gap-y-2 gap-x-4">
                    <div class="col-span-4 text-sm text-stone-400">Mã KH</div>
                    <div class="col-span-8 text-sm font-bold text-[#3C2A21]">
                      {{ invoice.customer?.id || "—" }}
                    </div>

                    <div class="col-span-4 text-sm text-stone-400">Tên</div>
                    <div class="col-span-8 text-sm font-medium">
                      {{
                        invoice.receiverName || invoice.customer?.name || "—"
                      }}
                    </div>

                    <div class="col-span-4 text-sm text-stone-400">SĐT</div>
                    <div class="col-span-8 text-sm font-medium" v-if="invoice.receiverName === 'Khách vãng lai'">
                      {{invoice.receiverPhone || "—"}}
                    </div>

                    <div class="col-span-8 text-sm font-medium">
                      {{invoice.customer?.phone || "—"}}
                    </div>

                    <div
                      class="col-span-4 text-sm text-stone-400"
                      v-if="invoice.receive_type === 'Online'"
                    >
                      Email
                    </div>
                    <div
                      class="col-span-8 text-sm font-medium"
                      v-if="invoice.receive_type === 'Online'"
                    >
                      {{
                        invoice.receiverEmail || invoice.customer?.email || "—"
                      }}
                    </div>

                    <div
                      class="col-span-4 text-sm text-stone-400"
                      v-if="invoice.receive_type === 'Online'"
                    >
                      Địa chỉ
                    </div>
                    <div
                      class="col-span-8 text-sm font-medium"
                      v-if="invoice.receive_type === 'Online'"
                    >
                      {{
                        invoice.shippingAddress ||
                        invoice.customer?.address ||
                        "—"
                      }}
                    </div>
                  </div>
                </div>

                <!-- Chi tiết món -->
                <div class="space-y-3">
                  <h4 class="font-bold text-stone-800 border-b pb-2">
                    Chi tiết món
                  </h4>

                  <div
                    v-for="(item, i) in invoice.items"
                    :key="i"
                    class="border-b border-dashed border-stone-100 pb-4 last:border-0 space-y-2"
                  >
                    <!-- Dòng tên + qty + tổng tiền -->
                    <div class="grid grid-cols-12 gap-4 items-start">
                      <div class="col-span-7">
                        <div class="font-bold text-stone-800">
                          {{ item.name }}
                        </div>
                      </div>
                      <div
                        class="col-span-1 text-center font-bold text-stone-400"
                      >
                        x{{ item.qty }}
                      </div>
                      <div class="col-span-4 text-right">
                        <div class="font-bold text-[#3C2A21]">
                          {{
                            (item.unitPrice * item.qty).toLocaleString("vi-VN")
                          }}
                          đ
                        </div>
                        <div class="text-xs text-stone-400 mt-0.5">
                          {{ item.basePrice.toLocaleString("vi-VN") }} đ ×
                          {{ item.qty }}
                        </div>
                      </div>
                    </div>

                    <!-- Size + giá upsize -->
                    <!-- Size + giá upsize -->
                    <div v-if="item.size" class="flex items-center gap-1.5">
                      <span
                        class="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200"
                      >
                        Size {{ item.size }}
                      </span>
                      <span
                        v-if="item.sizeExtra > 0"
                        class="text-[11px] font-semibold text-amber-600"
                      >
                        +{{ item.sizeExtra.toLocaleString("vi-VN") }} đ
                      </span>
                    </div>

                    <!-- Toppings + giá từng topping -->
                    <div
                      v-if="item.toppings?.length"
                      class="flex flex-col gap-1"
                    >
                      <div
                        v-for="(top, ti) in item.toppings"
                        :key="ti"
                        class="flex items-center gap-1.5"
                      >
                        <span
                          class="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style="
                            background: rgba(16, 185, 129, 0.08);
                            color: #059669;
                            border: 1px solid rgba(16, 185, 129, 0.2);
                          "
                        >
                          + {{ top.name }}
                        </span>
                        <span
                          v-if="top.price > 0"
                          class="text-[11px] font-semibold text-amber-600"
                        >
                          +{{ top.price.toLocaleString("vi-VN") }} đ
                        </span>
                      </div>
                    </div>

                    <!-- Đường / Đá -->
                    <div
                      v-if="item.sugar != null || item.ice != null"
                      class="flex flex-wrap gap-1"
                    >
                      <span
                        v-if="item.sugar != null"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style="
                          background: rgba(251, 191, 36, 0.12);
                          color: #d97706;
                          border: 1px solid rgba(251, 191, 36, 0.25);
                        "
                      >
                        Đường: {{ item.sugar }}%
                      </span>
                      <span
                        v-if="item.ice != null"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style="
                          background: rgba(59, 130, 246, 0.08);
                          color: #2563eb;
                          border: 1px solid rgba(59, 130, 246, 0.15);
                        "
                      >
                        Đá: {{ item.ice }}%
                      </span>
                    </div>

                    <!-- Custom coffee -->
                    <div v-if="item.isCustom" class="flex flex-wrap gap-1">
                      <span
                        v-if="item.beanName"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style="
                          background: rgba(120, 72, 40, 0.1);
                          color: #7c4a1e;
                          border: 1px solid rgba(120, 72, 40, 0.2);
                        "
                      >
                        {{ item.beanName }}
                      </span>
                      <span
                        v-if="item.baseName"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style="
                          background: rgba(99, 72, 50, 0.1);
                          color: #634832;
                          border: 1px solid rgba(99, 72, 50, 0.2);
                        "
                      >
                        {{ item.baseName }}
                      </span>
                      <span
                        v-if="item.milkName"
                        class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style="
                          background: rgba(59, 130, 246, 0.08);
                          color: #1d4ed8;
                          border: 1px solid rgba(59, 130, 246, 0.15);
                        "
                      >
                        {{ item.milkName }}
                      </span>
                    </div>

                    <!-- Ghi chú món -->
                    <div v-if="item.note" class="text-xs text-stone-400 italic">
                      Ghi chú: {{ item.note }}
                    </div>
                  </div>

                  <div
                    v-if="!invoice.items?.length"
                    class="text-center text-stone-400 text-sm py-4"
                  >
                    Không có món nào
                  </div>
                </div>

                <div
                  v-if="invoice.note"
                  class="rounded-xl border border-amber-100 bg-amber-50/60 p-4"
                >
                  <h4 class="font-bold text-stone-700 text-sm mb-1">
                    Ghi chú đơn hàng
                  </h4>
                  <p class="text-sm text-stone-600 italic">
                    {{ invoice.note }}
                  </p>
                </div>
              </div>

              <!-- RIGHT: Tổng tiền -->
              <div class="lg:col-span-4 space-y-4">
                <div class="rounded-xl bg-[#FAF7F2] p-5 space-y-3 sticky top-0">
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Tổng gốc</span>
                    <span class="font-bold"
                      >{{
                        (invoice.originalPrice || 0).toLocaleString("vi-VN")
                      }}
                      đ</span
                    >
                  </div>
                  <div class="flex justify-between text-sm text-red-500">
                    <span>Giảm giá</span>
                    <span v-if="invoice.promoCode"> ({{ invoice.promoCode }})</span>
                    <span class="font-bold"
                      >-
                      {{
                        (invoice.discountAmount || 0).toLocaleString("vi-VN")
                      }}
                      đ</span
                    >
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-500">Phí ship</span>
                    <span class="font-bold"
                      >{{
                        (invoice.shippingFee || 0).toLocaleString("vi-VN")
                      }}
                      đ</span
                    >
                  </div>
                  <div
                    class="pt-3 border-t border-stone-200 flex justify-between"
                  >
                    <span class="font-bold">Thành tiền</span>
                    <span class="text-lg font-black text-[#634832]">
                      {{ (invoice.finalPrice || 0).toLocaleString("vi-VN") }} đ
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
import { computed, ref } from "vue";

const props = defineProps({ invoice: Object });
defineEmits(["close"]);

const invoiceRef = ref(null);
const isPrinting = ref(false);

const statusClass = computed(() => {
  const s = props.invoice.status || "Đã hủy";
  if (s === "Đã giao") return "bg-green-100 text-green-700";
  if (s === "Đang giao") return "bg-blue-100 text-blue-700";
  if (s === "Đã hủy") return "bg-red-100 text-red-600";
  return "bg-orange-100 text-orange-700";
});

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
// Tổng giá topping của 1 item
function toppingTotal(item) {
  return (item.toppings || []).reduce((sum, t) => sum + (t.price || 0), 0);
}

// Đơn giá 1 món = basePrice + sizeExtra + tổng topping
function itemUnitWithTopping(item) {
  const base = item.unitPrice || 0;
  const size = item.sizeExtra || 0;
  const topping = toppingTotal(item);
  return base + size + topping;
}

// Tổng tiền = đơn giá đầy đủ × qty
function itemTotal(item) {
  return itemUnitWithTopping(item) * (item.qty || 1);
}

// ─────────────────────────────────────────────
//  Hàm in hóa đơn – thermal receipt style
// ─────────────────────────────────────────────
async function printInvoice() {
  if (isPrinting.value) return;
  isPrinting.value = true;

  try {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    );
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    );

    const inv = props.invoice;

    // ── helpers ──────────────────────────────
    const dash = (n = 42) => "-".repeat(n);
    const fmt = (v) => (v || 0).toLocaleString("vi-VN");
    const pad = (l, r, w = 42) => {
      // left-align l, right-align r trong tổng w ký tự (monospace)
      const gap = Math.max(1, w - l.length - r.length);
      return l + " ".repeat(gap) + r;
    };

    // ── items HTML ───────────────────────────
    const itemsHTML = (inv.items || [])
      .map((item, idx) => {
        const toppingLines = (item.toppings || [])
          .map(
            (t) =>
              `<div class="sub-line">  + ${t.name}${t.price ? ` (+${fmt(t.price)}đ)` : ""}</div>`,
          )
          .join("");

        const sugarIce = [];
        if (item.sugar != null) sugarIce.push(`Đường ${item.sugar}%`);
        if (item.ice != null) sugarIce.push(`Đá ${item.ice}%`);
        const sugarIceLine = sugarIce.length
          ? `<div class="sub-line">  [${sugarIce.join(" / ")}]</div>`
          : "";

        const customParts = [];
        if (item.beanName) customParts.push(` ${item.beanName}`);
        if (item.baseName) customParts.push(` ${item.baseName}`);
        if (item.milkName) customParts.push(` ${item.milkName}`);
        const customLine = customParts.length
          ? `<div class="sub-line">  [${customParts.join(" / ")}]</div>`
          : "";

        const noteLine = item.note
          ? `<div class="sub-line italic">  * ${item.note}</div>`
          : "";

        const sizeSuffix = item.size ? ` (${item.size})` : "";
        const name = `${idx + 1}. ${item.name}${sizeSuffix}`;
        const total = `${fmt(item.unitPrice * item.qty)}d`;

        return `
    <tr>
      <td class="item-col">
        <div class="item-name">${name}</div>
        <div class="sub-line">  x${item.qty} x ${fmt(item.basePrice ?? item.unitPrice ?? item.price)}d</div>
        ${sugarIceLine}
        ${customLine}
        ${toppingLines}
        ${noteLine}
      </td>
      <td class="price-col">${total}</td>
    </tr>`;
      })
      .join("");

    // ── payment method label ──────────────────
    const pmLabel = (() => {
      const pm = (inv.payment_method || "").toLowerCase();
      if (pm.includes("transfer") || pm.includes("chuyển"))
        return "Chuyển khoản";
      if (pm.includes("cash") || pm.includes("tiền mặt")) return "Tiền mặt";
      return inv.payment_method || "—";
    })();

    // ── cashier / table info ──────────────────
    const tableInfo = inv.table || inv.receive_type || "—";
    const cashier = inv.cashier || "Thu ngân";
    const now = inv.created_at || new Date().toLocaleString("vi-VN");

    // ── full HTML document ────────────────────
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  /* ── Receipt: 80mm thermal paper width ── */
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: #fff;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    color: #111;
    width: 302px; /* 80mm at 96dpi ≈ 302px; html2canvas @scale:2 → 604px */
  }

  #receipt {
    width: 302px;
    padding: 16px 14px 20px;
    background: #fff;
  }

  /* ── Logo / shop name ── */
  .logo-wrap {
    text-align: center;
    margin-bottom: 6px;
  }
  .logo-img {
    max-width: 130px;
    max-height: 60px;
    object-fit: contain;
  }
  .logo-fallback {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 6px;
    text-transform: uppercase;
  }

  /* ── Center text blocks ── */
  .center { text-align: center; }
  .bold   { font-weight: bold; }
  .sm     { font-size: 11px; }
  .italic { font-style: italic; }

  /* ── Dash divider ── */
  .dash {
    font-size: 12px;
    color: #555;
    text-align: center;
    letter-spacing: 0;
    line-height: 1.4;
    margin: 4px 0;
    overflow: hidden;
    white-space: nowrap;
  }

  /* ── Title ── */
  .receipt-title {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 6px 0 2px;
  }
  .invoice-id {
    text-align: center;
    font-size: 12px;
    margin-bottom: 4px;
  }

  /* ── Info grid (2 columns) ── */
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 12px;
  }
  .info-table td {
    padding: 1px 0;
    vertical-align: top;
  }
  .info-table .label { width: 45%; color: #333; }
  .info-table .value { font-weight: bold; }

  /* ── Items table ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
    font-size: 12px;
  }
  .items-table th {
    font-weight: bold;
    text-align: left;
    padding: 3px 0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .items-table th.price-col { text-align: right; white-space: nowrap; }
  .items-table td { vertical-align: top; padding: 3px 0; }
  .item-col  { width: 70%; }
  .price-col { width: 30%; text-align: right; white-space: nowrap; font-weight: bold; }
  .item-name { font-weight: bold; word-break: break-word; }
  .sub-line  { font-size: 11px; color: #444; }

  /* ── Totals ── */
  .totals-table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
    font-size: 12px;
  }
  .totals-table td { padding: 2px 0; }
  .totals-table .t-label { color: #333; }
  .totals-table .t-value { text-align: right; font-weight: bold; white-space: nowrap; }
  .totals-table .t-discount .t-value { color: #c00; }
  .totals-final td {
    font-size: 14px;
    font-weight: bold;
    padding-top: 5px;
  }
  .totals-final .t-value { font-size: 15px; }

  /* ── Payment ── */
  .payment-line {
    font-size: 12px;
    margin: 2px 0;
  }

  /* ── Note ── */
  .note-box {
    font-size: 12px;
    margin: 6px 0;
  }
  .note-box .note-label { font-weight: bold; }

  /* ── Footer ── */
  .footer {
    text-align: center;
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.7;
  }
  .footer .powered {
    font-size: 10px;
    color: #888;
    margin-top: 4px;
  }
</style>
</head>
<body>
<div id="receipt">

  <!-- LOGO -->
  <div class="logo-wrap">
    <img class="logo-img" src="../IMG/DripLab_Logo.png"
      onerror="this.style.display='none';document.getElementById('logo-fb').style.display='block';" />
    <div id="logo-fb" class="logo-fallback" style="display:none;">DRIPLAB</div>
  </div>

  <!-- TITLE -->
  <div class="receipt-title">Hóa Đơn Thanh Toán</div>
  <div class="invoice-id">Số HĐ: ${inv.invoice_id || ""}</div>

  <!-- DASH -->
  <div class="dash">${dash(38)}</div>

  <!-- ORDER INFO – 2-column grid like the receipt -->
  <table class="info-table">
    <tr>
      <td class="label">Mã HĐ:</td>
      <td class="value">#${String(inv.order_id || "").replace(/^#/, "")}</td>
    </tr>
    <tr>
      <td class="label">Bàn:</td>
      <td class="value">${tableInfo}</td>
    </tr>
    <tr>
      <td class="label">Giờ vào:</td>
      <td class="value">${now}</td>
    </tr>
  </table>

  <!-- CASHIER row (right-aligned pair, like "TN: Thu ngân 1") -->
  <table class="info-table">
    <tr>
      <td class="label">TN:</td>
      <td class="value">${cashier}</td>
    </tr>
    ${
      inv.customer?.name && inv.customer.name !== "Khách lẻ"
        ? `
    <tr>
      <td class="label">Khách hàng:</td>
      <td class="value">${inv.customer.name}</td>
    </tr>
    ${inv.customer?.phone ? `<tr><td class="label">SĐT:</td><td class="value">${inv.customer.phone}</td></tr>` : ""}
    `
        : ""
    }
  </table>

  <!-- DASH -->
  <div class="dash">${dash(38)}</div>

  <!-- ITEMS TABLE -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="item-col">STT  Tên món</th>
        <th class="price-col">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <!-- DASH -->
  <div class="dash">${dash(38)}</div>

  <!-- TOTALS -->
  <table class="totals-table">
    <tr>
      <td class="t-label">Thành tiền:</td>
      <td class="t-value">${fmt(inv.originalPrice)}d</td>
    </tr>
    ${
      inv.discountAmount
        ? `
    <tr class="t-discount">
      <td class="t-label">Giảm giá:</td>
      <td class="t-value" style="color:#c00;">- ${fmt(inv.discountAmount)}d</td>
    </tr>`
        : ""
    }
    ${
      inv.shippingFee
        ? `
    <tr>
      <td class="t-label">Phí ship:</td>
      <td class="t-value">${fmt(inv.shippingFee)}d</td>
    </tr>`
        : ""
    }
    <tr class="totals-final">
      <td class="t-label">Tổng tiền:</td>
      <td class="t-value">${fmt(inv.finalPrice)}d</td>
    </tr>
  </table>

  <!-- PAYMENT -->
  <div class="dash">${dash(38)}</div>
  <div class="payment-line">+Thanh toán (${pmLabel}):&nbsp;&nbsp;<strong>${fmt(inv.finalPrice)}d</strong></div>

  <!-- ORDER NOTE -->
  ${
    inv.note
      ? `
  <div class="dash">${dash(38)}</div>
  <div class="note-box">
    <span class="note-label">Ghi chú: </span>${inv.note}
  </div>`
      : ""
  }

  <!-- FOOTER -->
  <div class="dash">${dash(38)}</div>
  <div class="footer">
    <div><strong>DRIPLAB</strong></div>
    <div class="sm">${inv.address || ""}</div>
    ${inv.wifi ? `<div class="sm">Wifi: ${inv.wifi}</div>` : ""}
    <div style="margin-top:6px;">Cảm ơn Quý Khách!</div>
    <div class="powered">Powered by DripLab POS</div>
  </div>

</div>
</body>
</html>`;

    // ── Render vào iframe ẩn ──────────────────
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:302px;height:1200px;border:none;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    // Chờ fonts + layout render
    await new Promise((r) => setTimeout(r, 1400));

    const receiptEl = iframe.contentDocument.getElementById("receipt");
    const receiptH = receiptEl.scrollHeight;
    iframe.style.height = receiptH + "px";

    // Chụp bằng html2canvas
    const canvas = await html2canvas(receiptEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 302,
      height: receiptH,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 302,
      windowHeight: receiptH,
    });

    document.body.removeChild(iframe);

    // ── Xuất PDF (width 80mm, height tự động) ──
    const { jsPDF } = window.jspdf;
    const MM_WIDTH = 80; // mm
    const imgWmm = MM_WIDTH;
    const imgHmm = (canvas.height / canvas.width) * MM_WIDTH;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [MM_WIDTH, imgHmm], // trang vừa đúng chiều dài receipt
    });

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.98),
      "JPEG",
      0,
      0,
      imgWmm,
      imgHmm,
    );

    pdf.save(`hoadon_${inv.invoice_id || "export"}.pdf`);
  } catch (err) {
    console.error("Lỗi xuất PDF:", err);
    alert("Xuất PDF thất bại: " + err.message);
  } finally {
    isPrinting.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
