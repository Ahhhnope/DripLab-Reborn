/* ══════════════════════════════════════════════════
   MoMo.CSS  —  Giao diện QR + ATM + Thanh toán MoMo
   Phiên bản đầy đủ với Screen 4, 5, 6
══════════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');

/* ── Overlay ──────────────────────────────────────── */
.momo-qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  font-family: 'Be Vietnam Pro', sans-serif;
}

/* ── Dialog wrapper ────────────────────────────────── */
.momo-qr-dialog {
  background: #ffffff;
  border-radius: 12px;
  width: 820px;
  max-width: 96vw;
  max-height: 92vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.28);
  animation: momoFadeUp 0.32s ease;
}

.momo-qr-dialog.screen-atm {
  width: 900px;
}

.momo-qr-dialog.screen-success {
  width: 520px;
}

@keyframes momoFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ─────────────────────────────────────────── */
.momo-qr-header {
  background: #a50064;
  border-radius: 12px 12px 0 0;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.momo-qr-header-logo {
  height: 36px;
  object-fit: contain;
}

.momo-qr-header-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin: 0;
}

.momo-qr-header-close {
  margin-left: auto;
  background: rgba(255,255,255,0.18);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.momo-qr-header-close:hover { background: rgba(255,255,255,0.32); }

/* ── Cột trái chung (thông tin đơn hàng) ──────────── */
.momo-qr-info {
  width: 260px;
  min-width: 220px;
  background: #f9f9f9;
  border-right: 1px solid #ececec;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.momo-qr-info-title {
  font-size: 15px;
  font-weight: 800;
  color: #222;
  margin: 0 0 4px;
}

.momo-qr-info-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.momo-qr-info-label {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.momo-qr-info-value {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  word-break: break-all;
}

.momo-qr-info-value.provider {
  display: flex;
  align-items: center;
  gap: 7px;
}

.momo-qr-info-value.provider img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
}

.momo-qr-amount {
  font-size: 22px;
  font-weight: 900;
  color: #a50064;
}

/* Countdown */
.momo-qr-expire {
  background: #fff4f9;
  border: 1.5px solid #f5c0dc;
  border-radius: 10px;
  padding: 12px 14px;
}

.momo-qr-expire-label {
  font-size: 11px;
  color: #a50064;
  font-weight: 700;
  margin-bottom: 8px;
}

.momo-qr-expire-timer {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.momo-qr-expire-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.momo-qr-expire-num {
  background: #a50064;
  color: #fff;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 900;
  width: 44px;
  text-align: center;
  padding: 4px 0;
  letter-spacing: 1px;
}

.momo-qr-expire-unit-label {
  font-size: 10px;
  color: #999;
  margin-top: 3px;
  font-weight: 600;
}

.momo-qr-expire-colon {
  font-size: 22px;
  font-weight: 900;
  color: #a50064;
  margin-bottom: 12px;
}

.momo-qr-back {
  background: none;
  border: none;
  color: #a50064;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  margin-top: auto;
  padding: 4px 0;
  transition: opacity 0.2s;
}
.momo-qr-back:hover { opacity: 0.7; }

.momo-inline-error {
  font-size: 12px;
  color: #c00;
  font-weight: 600;
  background: #fff0f0;
  border-radius: 6px;
  padding: 8px 10px;
}

.momo-help-link {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.momo-help-link a {
  color: #a50064;
  text-decoration: underline;
}

.momo-safe-link {
  color: #a50064;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
}

/* ══════════════════════════════════════════════════
   SCREEN 4 — CHỌN PHƯƠNG THỨC
══════════════════════════════════════════════════ */
.momo-method-body {
  display: flex;
  flex-direction: row;
  min-height: 440px;
}

.momo-method-right {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.momo-method-title {
  font-size: 18px;
  font-weight: 800;
  color: #222;
  margin: 0 0 4px;
}

/* Notice box */
.momo-provider-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #444;
  font-weight: 500;
}

.notice-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

/* Phương thức thanh toán items */
.momo-method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  position: relative;
  user-select: none;
}

.momo-method-item:not(.disabled-method):hover {
  border-color: #a50064;
  background: #fff5fb;
  transform: translateY(-1px);
}

/* Disabled: vô hiệu hoá QR momo & Visa */
.disabled-method {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.4);
  pointer-events: none;
}

/* Active (ATM đã chọn) */
.active-method {
  border-color: #d63484;
  background: #fff5fb;
}

.method-radio-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.method-radio--selected {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a50064;
  border: none;
}

.active-method .method-radio-wrap {
  border-color: #a50064;
}

.method-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.method-icon {
  width: 44px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.atm-icon {
  background: linear-gradient(135deg, #0066cc, #0099ff);
  color: #fff;
  border: 1.5px solid #004499;
}

.visa-icon {
  background: linear-gradient(135deg, #1a1f71, #003087);
  color: #fff;
  font-size: 10px;
  font-style: italic;
}

.method-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.method-disabled-badge {
  background: #f0f0f0;
  color: #999;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
}

.momo-continue-btn {
  margin-top: auto;
  width: 100%;
  background: #a50064;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 800;
  font-family: 'Be Vietnam Pro', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.momo-continue-btn:hover {
  background: #7d004b;
  transform: translateY(-1px);
}

/* ══════════════════════════════════════════════════
   SCREEN 5 — NHẬP THẺ ATM
══════════════════════════════════════════════════ */
.momo-atm-body {
  display: flex;
  flex-direction: row;
  min-height: 520px;
}

.momo-atm-right {
  flex: 1;
  padding: 20px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow-y: auto;
}

.momo-atm-right::-webkit-scrollbar { width: 4px; }
.momo-atm-right::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

.atm-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.atm-icon-badge {
  background: linear-gradient(135deg, #0066cc, #0099ff);
  color: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
}

.atm-form-title {
  font-size: 16px;
  font-weight: 800;
  color: #222;
  margin: 0;
}

/* ── Card Visual ─────────────────────────── */
.atm-card-visual {
  width: 100%;
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(135deg, #a50064 0%, #d63484 50%, #ff6eb4 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(165, 0, 100, 0.35);
  transition: background 0.4s;
  flex-shrink: 0;
}

.atm-card-visual.bank-TCB {
  background: linear-gradient(135deg, #8b0000 0%, #e31837 50%, #ff6b6b 100%);
  box-shadow: 0 8px 24px rgba(227, 24, 55, 0.35);
}

.atm-card-visual.bank-MB {
  background: linear-gradient(135deg, #03174a 0%, #0a2d7e 50%, #1d5fb8 100%);
  box-shadow: 0 8px 24px rgba(10, 45, 126, 0.35);
}

/* Shine effect */
.atm-card-visual::before {
  content: '';
  position: absolute;
  top: -40%;
  left: -20%;
  width: 60%;
  height: 180%;
  background: rgba(255,255,255,0.08);
  transform: rotate(25deg);
  pointer-events: none;
}

.atm-card-visual::after {
  content: '';
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
}

.atm-card-inner {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.atm-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.atm-card-chip {
  width: 34px;
  height: 26px;
  background: linear-gradient(135deg, #ffd700, #b8860b);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 4px 5px;
}

.chip-line {
  height: 2px;
  background: rgba(0,0,0,0.25);
  border-radius: 1px;
}

.atm-card-bank-name {
  font-size: 13px;
  font-weight: 800;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.5px;
}

.atm-card-number {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.atm-card-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.atm-card-meta-label {
  font-size: 9px;
  color: rgba(255,255,255,0.65);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 2px;
}

.atm-card-meta-val {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.atm-card-napas {
  display: flex;
  align-items: center;
}

.napas-logo {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
  font-style: italic;
}

/* ── Chọn ngân hàng nhanh ─────────────────── */
.atm-bank-row {
  display: flex;
  gap: 8px;
}

.atm-bank-btn {
  flex: 1;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Be Vietnam Pro', sans-serif;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.atm-bank-btn:hover {
  border-color: #a50064;
  background: #fff5fb;
  transform: translateY(-1px);
}

.atm-bank-btn.bank-selected {
  font-weight: 800;
}

.bank-btn-emoji { font-size: 14px; }

/* ── Error banner ─────────────────────────── */
.atm-error-banner {
  background: #fff0f0;
  border: 1.5px solid #ffaaaa;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #c00;
}

/* ── Form grid ────────────────────────────── */
.atm-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.atm-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.atm-field.full { grid-column: 1 / -1; }
.atm-field.half { grid-column: span 1; }

.atm-field label {
  font-size: 12px;
  font-weight: 700;
  color: #444;
}

.field-hint {
  color: #999;
  cursor: help;
}

.atm-input {
  border: 1.5px solid #ddd;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: 'Be Vietnam Pro', sans-serif;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.atm-input:focus {
  border-color: #a50064;
  box-shadow: 0 0 0 3px rgba(165, 0, 100, 0.08);
}

.atm-input.error {
  border-color: #cc0000;
  background: #fff8f8;
}

.atm-field-error {
  font-size: 11px;
  color: #cc0000;
  font-weight: 600;
}

/* ── Pay button ───────────────────────────── */
.atm-pay-btn {
  width: 100%;
  background: #a50064;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 13px;
  font-size: 15px;
  font-weight: 800;
  font-family: 'Be Vietnam Pro', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.atm-pay-btn:hover:not(:disabled) {
  background: #7d004b;
  transform: translateY(-1px);
}

.atm-pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.atm-pay-btn.loading { background: #7d004b; }

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: momoSpin 0.85s linear infinite;
  flex-shrink: 0;
}

/* ── Test cards ───────────────────────────── */
.atm-test-cards {
  font-size: 12px;
}

.atm-test-cards summary {
  cursor: pointer;
  color: #a50064;
  font-weight: 700;
  padding: 6px 0;
  user-select: none;
}

.atm-test-table-wrap {
  overflow-x: auto;
  margin-top: 8px;
}

.atm-test-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.atm-test-table th {
  background: #f5f5f5;
  padding: 6px 8px;
  text-align: left;
  font-weight: 700;
  color: #555;
  border-bottom: 1px solid #ddd;
}

.test-card-row {
  cursor: pointer;
  transition: background 0.15s;
}

.test-card-row:hover { background: #fff5fb; }

.atm-test-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.card-num-cell {
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 1px;
}

.card-result-badge {
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 700;
}

.badge-ok {
  background: #e6f9ee;
  color: #197a3a;
}

.badge-fail {
  background: #fff0f0;
  color: #c00;
}

/* ── Bank logos bottom ────────────────────── */
.atm-banks-supported {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.bank-logo-item {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
}

.tcb-logo { background: #fff0f0; color: #e31837; border-color: #f5c0c0; }
.mb-logo  { background: #f0f4ff; color: #0a2d7e; border-color: #b0c4e8; }

.more-banks {
  font-size: 10px;
  color: #999;
  font-weight: 600;
}

/* ══════════════════════════════════════════════════
   SCREEN 6 — THÀNH CÔNG
══════════════════════════════════════════════════ */
.momo-success-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 40px 32px;
  min-height: 360px;
  gap: 20px;
}

.success-check-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-check-circle {
  width: 90px;
  height: 90px;
}

.success-checkmark {
  width: 90px;
  height: 90px;
}

.check-circle-bg {
  stroke: #22c55e;
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: checkCircle 0.6s ease forwards;
}

.check-path {
  stroke: #22c55e;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkMark 0.4s 0.5s ease forwards;
}

@keyframes checkCircle {
  to { stroke-dashoffset: 0; }
}

@keyframes checkMark {
  to { stroke-dashoffset: 0; }
}

.success-screen-title {
  font-size: 22px;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
}

.success-amount-box {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 18px 40px;
  text-align: center;
  border: 1.5px solid #e8e8e8;
  min-width: 240px;
}

.success-provider {
  font-size: 13px;
  color: #888;
  font-weight: 600;
  margin: 0 0 4px;
}

.success-big-amount {
  font-size: 32px;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
}

.success-redirect-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #888;
  text-align: center;
  font-weight: 500;
}

.redirect-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f0e0ea;
  border-top-color: #a50064;
  border-radius: 50%;
  animation: momoSpin 0.85s linear infinite;
  flex-shrink: 0;
}

.success-done-btn {
  background: none;
  border: none;
  color: #a50064;
  font-size: 15px;
  font-weight: 800;
  font-family: 'Be Vietnam Pro', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  padding: 6px 0;
  transition: opacity 0.2s;
}
.success-done-btn:hover { opacity: 0.7; }

/* ── Footer ─────────────────────────────────────── */
.momo-qr-footer {
  background: #f9f9f9;
  border-top: 1px solid #ececec;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.momo-qr-footer-copy {
  font-size: 11px;
  color: #bbb;
  font-weight: 500;
}

.momo-qr-footer-hotline {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.momo-qr-footer-hotline span {
  color: #a50064;
  font-weight: 800;
}

.momo-qr-footer-hotline em {
  font-style: normal;
  color: #999;
  font-size: 11px;
}

/* ── Animations ─────────────────────────────────── */
@keyframes momoSpin {
  to { transform: rotate(360deg); }
}

@keyframes momoFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Scrollbar ──────────────────────────────────── */
.momo-qr-dialog::-webkit-scrollbar { width: 4px; }
.momo-qr-dialog::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

/* ── Responsive mobile ──────────────────────────── */
@media (max-width: 640px) {
  .momo-method-body,
  .momo-atm-body {
    flex-direction: column;
  }

  .momo-qr-info {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ececec;
    padding: 18px 16px;
  }

  .momo-method-right,
  .momo-atm-right {
    padding: 18px 16px;
  }

  .atm-form-grid {
    grid-template-columns: 1fr;
  }

  .atm-field.half { grid-column: 1 / -1; }
}