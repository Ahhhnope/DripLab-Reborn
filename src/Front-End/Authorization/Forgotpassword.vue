<script setup>
import { useForgotPassword } from '../Authorization/ForgotPassword.js'

const {
  step,
  email, otp, newPwd, confirmPwd,
  showNewPwd, showCfmPwd,
  isLoading, errorMsg, successMsg,
  resendCooldown,
  handleSendOtp,
  handleVerifyOtp,
  handleResendOtp,
  handleResetPassword,
  goBack,
  goLogin,
} = useForgotPassword()
</script>

<template>
  <div class="lab-root">

    <!-- ── Background (giữ nguyên như Login) ── -->
    <div class="lab-bg">
      <div class="lab-grid"></div>

      <div class="mol mol-1"></div>
      <div class="mol mol-2"></div>
      <div class="mol mol-3"></div>
      <div class="mol mol-4"></div>
      <div class="mol mol-5"></div>
      <div class="mol mol-6"></div>

      <div class="drip-container">
        <div class="drip-drop d1"></div>
        <div class="drip-drop d2"></div>
        <div class="drip-drop d3"></div>
        <div class="drip-drop d4"></div>
        <div class="drip-drop d5"></div>
      </div>

      <svg class="beaker beaker-left" viewBox="0 0 80 120" fill="none">
        <path d="M20 10 L20 65 L8 105 Q6 112 14 112 L66 112 Q74 112 72 105 L60 65 L60 10 Z" stroke="#8B5E3C" stroke-width="2" fill="rgba(139,94,60,0.07)"/>
        <path d="M20 10 L60 10" stroke="#8B5E3C" stroke-width="2"/>
        <ellipse cx="40" cy="85" rx="22" ry="8" fill="rgba(139,94,60,0.18)" class="liquid-anim"/>
        <text x="40" y="90" text-anchor="middle" font-size="7" fill="#8B5E3C" opacity="0.6" font-family="monospace">C₈H₁₀N₄O₂</text>
        <circle cx="52" cy="70" r="3"   fill="rgba(139,94,60,0.3)"  class="bubble b1"/>
        <circle cx="35" cy="75" r="2"   fill="rgba(139,94,60,0.25)" class="bubble b2"/>
        <circle cx="44" cy="68" r="1.5" fill="rgba(139,94,60,0.2)"  class="bubble b3"/>
      </svg>

      <svg class="beaker beaker-right" viewBox="0 0 60 100" fill="none">
        <path d="M15 8 L15 55 L5 85 Q3 92 11 92 L49 92 Q57 92 55 85 L45 55 L45 8 Z" stroke="#C4956A" stroke-width="1.5" fill="rgba(196,149,106,0.06)"/>
        <path d="M15 8 L45 8" stroke="#C4956A" stroke-width="1.5"/>
        <ellipse cx="30" cy="72" rx="16" ry="6" fill="rgba(196,149,106,0.2)" class="liquid-anim"/>
        <circle cx="36" cy="58" r="2"   fill="rgba(196,149,106,0.3)"  class="bubble b2"/>
        <circle cx="24" cy="62" r="1.5" fill="rgba(196,149,106,0.25)" class="bubble b4"/>
      </svg>

      <svg class="flask" viewBox="0 0 70 90" fill="none">
        <line x1="25" y1="5"  x2="25" y2="28" stroke="#6B4423" stroke-width="1.5"/>
        <line x1="45" y1="5"  x2="45" y2="28" stroke="#6B4423" stroke-width="1.5"/>
        <line x1="20" y1="5"  x2="50" y2="5"  stroke="#6B4423" stroke-width="1.5"/>
        <path d="M25 28 L10 60 Q5 80 35 82 Q65 80 60 60 L45 28 Z" stroke="#6B4423" stroke-width="1.5" fill="rgba(107,68,35,0.08)"/>
        <ellipse cx="35" cy="65" rx="18" ry="7" fill="rgba(107,68,35,0.2)" class="liquid-anim"/>
        <circle cx="28" cy="55" r="2"   fill="rgba(107,68,35,0.3)"  class="bubble b3"/>
        <circle cx="42" cy="50" r="1.5" fill="rgba(107,68,35,0.25)" class="bubble b1"/>
      </svg>
    </div>

    <!-- ══════════════════════════════════
         STEP 4: Thành công
    ══════════════════════════════════ -->
    <div v-if="step === 4" class="success-card">
      <div class="success-icon">
        <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
          <circle cx="30" cy="30" r="28" stroke="#5A9E7A" stroke-width="1.5"/>
          <path d="M18 30 L26 38 L42 22" stroke="#5A9E7A" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="check-draw"/>
        </svg>
      </div>
      <p class="success-label">PASSWORD RESET</p>
      <h2 class="success-title">Thành công!</h2>
      <p class="success-sub">
        Mật khẩu của bạn đã được cập nhật.<br/>
        Hãy đăng nhập lại để tiếp tục.
      </p>
      <button class="submit-btn" @click="goLogin">
        <span class="btn-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Đăng nhập ngay
        </span>
      </button>
    </div>

    <!-- ══════════════════════════════════
         CARD CHÍNH (step 1 / 2 / 3)
    ══════════════════════════════════ -->
    <div v-else class="lab-card" :class="{ loading: isLoading }">

      <div class="card-header">
        <div class="lab-logo">
          <img src="../IMG/DripLab_Logo.png">
        </div>
        <h1 class="lab-title">Drip Lab</h1>
        <div class="lab-divider">
          <span>{{ step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Xác nhận OTP' : 'Đặt mật khẩu mới' }}</span>
        </div>
      </div>

      <!-- ── STEP INDICATOR ── -->
      <div class="fp-steps">
        <div class="fp-step" :class="{ active: step >= 1, done: step > 1 }">
          <div class="fp-step-dot">
            <svg v-if="step > 1" width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span v-else>1</span>
          </div>
          <span class="fp-step-label">Email</span>
        </div>
        <div class="fp-step-line" :class="{ done: step > 1 }"></div>
        <div class="fp-step" :class="{ active: step >= 2, done: step > 2 }">
          <div class="fp-step-dot">
            <svg v-if="step > 2" width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span v-else>2</span>
          </div>
          <span class="fp-step-label">Mã OTP</span>
        </div>
        <div class="fp-step-line" :class="{ done: step > 2 }"></div>
        <div class="fp-step" :class="{ active: step >= 3 }">
          <div class="fp-step-dot"><span>3</span></div>
          <span class="fp-step-label">Mật khẩu</span>
        </div>
      </div>

      <!-- ── STEP 1: Nhập Email ── -->
      <form v-if="step === 1" class="lab-form" @submit.prevent="handleSendOtp">
        <p class="fp-desc">
          Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.
        </p>

        <div class="field-group">
          <label class="field-label"><span>Email</span></label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8 L12 14 L22 8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input
              v-model="email"
              type="email"
              class="field-input"
              placeholder="example@email.com"
              autocomplete="email"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ errorMsg }}
        </div>

        <button type="submit" class="submit-btn" :class="{ submitting: isLoading }">
          <span v-if="!isLoading" class="btn-inner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Gửi mã OTP
          </span>
          <span v-else class="btn-loading">
            <span class="loading-dots"><span></span><span></span><span></span></span>
            Brewing...
          </span>
        </button>
      </form>

      <!-- ── STEP 2: Nhập OTP ── -->
      <form v-else-if="step === 2" class="lab-form" @submit.prevent="handleVerifyOtp">
        <p class="fp-desc">
          Mã OTP đã được gửi tới <strong>{{ email }}</strong>.<br/>
          Vui lòng kiểm tra hộp thư (kể cả thư rác).
        </p>

        <div class="field-group">
          <label class="field-label"><span>Mã OTP</span></label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 11V7A4 4 0 0 1 16 7v4" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
            <input
              v-model="otp"
              type="text"
              inputmode="numeric"
              class="field-input fp-otp-input"
              placeholder="Nhập mã 6 số"
              maxlength="6"
              autocomplete="one-time-code"
            />
          </div>
        </div>

        <div v-if="successMsg" class="fp-success-msg">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ successMsg }}
        </div>

        <div v-if="errorMsg" class="error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ errorMsg }}
        </div>

        <button type="submit" class="submit-btn" :class="{ submitting: isLoading }">
          <span v-if="!isLoading" class="btn-inner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Xác nhận OTP
          </span>
          <span v-else class="btn-loading">
            <span class="loading-dots"><span></span><span></span><span></span></span>
            Brewing...
          </span>
        </button>

        <div class="fp-resend-row">
          <span class="fp-resend-text">Không nhận được mã?</span>
          <button
            type="button"
            class="link-btn"
            :disabled="resendCooldown > 0 || isLoading"
            :class="{ 'link-btn-disabled': resendCooldown > 0 }"
            @click="handleResendOtp"
          >
            {{ resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại OTP' }}
          </button>
        </div>
      </form>

      <!-- ── STEP 3: Đặt mật khẩu mới ── -->
      <form v-else-if="step === 3" class="lab-form" @submit.prevent="handleResetPassword">
        <p class="fp-desc">Tạo mật khẩu mới cho tài khoản <strong>{{ email }}</strong>.</p>

        <div class="field-group">
          <label class="field-label"><span>Mật khẩu mới</span></label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 11V7A4 4 0 0 1 16 7v4" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
            <input
              v-model="newPwd"
              :type="showNewPwd ? 'text' : 'password'"
              class="field-input"
              placeholder="Ít nhất 6 ký tự"
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showNewPwd = !showNewPwd" tabindex="-1">
              <svg v-if="!showNewPwd" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M1 1l22 22"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label"><span>Xác nhận mật khẩu</span></label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 11V7A4 4 0 0 1 16 7v4" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
            <input
              v-model="confirmPwd"
              :type="showCfmPwd ? 'text' : 'password'"
              class="field-input"
              :class="{ mismatch: confirmPwd && newPwd !== confirmPwd }"
              placeholder="Nhập lại mật khẩu"
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showCfmPwd = !showCfmPwd" tabindex="-1">
              <svg v-if="!showCfmPwd" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M1 1l22 22"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ errorMsg }}
        </div>

        <button type="submit" class="submit-btn" :class="{ submitting: isLoading }">
          <span v-if="!isLoading" class="btn-inner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Đặt lại mật khẩu
          </span>
          <span v-else class="btn-loading">
            <span class="loading-dots"><span></span><span></span><span></span></span>
            Brewing...
          </span>
        </button>
      </form>

      <!-- ── Footer ── -->
      <div class="card-footer">
        <button class="home-btn" @click="goBack">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ step === 1 ? 'Quay lại đăng nhập' : 'Quay lại' }}
        </button>
      </div>

    </div>

  </div>
</template>

<style src="./Auth.css"></style>

<style scoped>
/* ── Step indicator ── */
.fp-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 22px;
}

.fp-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.fp-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(139, 94, 60, 0.25);
  background: rgba(240, 235, 228, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: rgba(139, 94, 60, 0.4);
  transition: all 0.3s ease;
}

.fp-step.active .fp-step-dot {
  border-color: #8B5E3C;
  background: #8B5E3C;
  color: #fff;
}

.fp-step.done .fp-step-dot {
  border-color: #5A9E7A;
  background: #5A9E7A;
  color: #fff;
}

.fp-step-label {
  font-size: 10px;
  color: rgba(139, 94, 60, 0.4);
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.3s;
}

.fp-step.active .fp-step-label,
.fp-step.done .fp-step-label {
  color: #8B5E3C;
}

.fp-step-line {
  width: 36px;
  height: 2px;
  background: rgba(139, 94, 60, 0.15);
  margin-bottom: 16px;
  transition: background 0.3s;
}

.fp-step-line.done {
  background: #5A9E7A;
}

/* ── Description text ── */
.fp-desc {
  font-size: 13px;
  color: rgba(61, 43, 26, 0.6);
  line-height: 1.6;
  margin: 0 0 4px;
  text-align: center;
}

.fp-desc strong {
  color: #8B5E3C;
  font-weight: 600;
}

/* ── OTP input bigger text ── */
.fp-otp-input {
  font-size: 18px !important;
  letter-spacing: 0.25em;
  text-align: center;
  font-weight: 600;
}

/* ── Success message ── */
.fp-success-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5A9E7A;
  background: rgba(90, 158, 122, 0.08);
  border: 1px solid rgba(90, 158, 122, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
}

/* ── Resend row ── */
.fp-resend-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: -4px;
}

.fp-resend-text {
  font-size: 12px;
  color: rgba(61, 43, 26, 0.45);
}

.link-btn-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
</style>