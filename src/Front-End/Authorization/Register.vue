<script setup>
import { useRegister } from '../Authorization/Register.JS'

const {
  name,
  email,
  phone,
  password,
  confirm,
  showPwd,
  showCfm,
  isLoading,
  errorMsg,
  step,
  strength,
  strengthLabel,
  strengthColor,
  handleRegister,
  goLogin,
  goHome,
} = useRegister()
</script>

<template>
  <div class="lab-root">

    <!-- ── Background ── -->
    <div class="lab-bg">
      <div class="lab-grid"></div>

      <div class="mol mol-1"></div>
      <div class="mol mol-2"></div>
      <div class="mol mol-3"></div>
      <div class="mol mol-4"></div>
      <div class="mol mol-5"></div>

      <svg class="tubes" viewBox="0 0 200 300" fill="none">
        <rect x="20" y="20" width="22" height="120" rx="11" stroke="#8B5E3C" stroke-width="1.5" fill="rgba(139,94,60,0.05)"/>
        <rect x="20" y="100" width="22" height="40" rx="0" fill="rgba(139,94,60,0.2)" class="liquid-anim"/>
        <ellipse cx="31" cy="140" rx="11" ry="4" fill="rgba(139,94,60,0.3)" class="liquid-anim"/>
        <circle cx="31" cy="110" r="2"   fill="rgba(139,94,60,0.25)" class="bubble b1"/>
        <circle cx="31" cy="125" r="1.5" fill="rgba(139,94,60,0.2)"  class="bubble b2"/>

        <rect x="60" y="10" width="22" height="140" rx="11" stroke="#C4956A" stroke-width="1.5" fill="rgba(196,149,106,0.04)"/>
        <rect x="60" y="80" width="22" height="70"  rx="0" fill="rgba(196,149,106,0.18)" class="liquid-anim"/>
        <ellipse cx="71" cy="150" rx="11" ry="4" fill="rgba(196,149,106,0.3)" class="liquid-anim"/>
        <circle cx="71" cy="100" r="1.5" fill="rgba(196,149,106,0.3)" class="bubble b3"/>

        <rect x="100" y="30" width="22" height="100" rx="11" stroke="#6B8B5E" stroke-width="1.5" fill="rgba(107,139,94,0.04)"/>
        <rect x="100" y="90" width="22" height="40"  rx="0" fill="rgba(107,139,94,0.15)" class="liquid-anim"/>
        <ellipse cx="111" cy="130" rx="11" ry="4" fill="rgba(107,139,94,0.25)" class="liquid-anim"/>

        <line x1="20"  y1="20" x2="42"  y2="20" stroke="#8B5E3C" stroke-width="2"/>
        <line x1="60"  y1="10" x2="82"  y2="10" stroke="#C4956A" stroke-width="2"/>
        <line x1="100" y1="30" x2="122" y2="30" stroke="#6B8B5E" stroke-width="2"/>
      </svg>

      <svg class="formula-bg" viewBox="0 0 300 80" fill="none">
        <text x="0" y="30" font-family="monospace" font-size="11" fill="rgba(139,94,60,0.15)">
          C₈H₁₀N₄O₂ + H₂O → ΔT:93°C → ☕
        </text>
        <text x="0" y="55" font-family="monospace" font-size="9" fill="rgba(139,94,60,0.1)">
          Caffeine + Maillard Reaction → Drip Lab Extract
        </text>
      </svg>

      <svg class="beaker-r" viewBox="0 0 80 120" fill="none">
        <path d="M20 10 L20 65 L8 105 Q6 112 14 112 L66 112 Q74 112 72 105 L60 65 L60 10 Z" stroke="#8B5E3C" stroke-width="1.5" fill="rgba(139,94,60,0.05)"/>
        <path d="M20 10 L60 10" stroke="#8B5E3C" stroke-width="1.5"/>
        <ellipse cx="40" cy="88" rx="22" ry="8" fill="rgba(139,94,60,0.15)" class="liquid-anim"/>
        <circle cx="48" cy="72" r="2.5" fill="rgba(139,94,60,0.25)" class="bubble b2"/>
        <circle cx="32" cy="78" r="1.5" fill="rgba(139,94,60,0.2)"  class="bubble b4"/>
      </svg>

      <div class="drip-container">
        <div class="drip-drop d1"></div>
        <div class="drip-drop d2"></div>
        <div class="drip-drop d3"></div>
        <div class="drip-drop d4"></div>
      </div>
    </div>

    <!-- ── Success screen ── -->
    <div v-if="step === 2" class="success-card">
      <div class="success-icon">
        <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
          <circle cx="30" cy="30" r="28" stroke="#5A9E7A" stroke-width="1.5"/>
          <path d="M18 30 L26 38 L42 22" stroke="#5A9E7A" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="check-draw"/>
        </svg>
      </div>
      <p class="success-label">SPECIMEN LOGGED</p>
      <h2 class="success-title">Welcome to the Lab</h2>
      <p class="success-sub">
        Tài khoản của bạn đã được tạo thành công.<br/>
        Chào mừng bạn đến với Drip Lab.
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

    <!-- ── Register card ── -->
    <div v-else class="lab-card" :class="{ loading: isLoading }">

      <div class="card-header">
        <div class="lab-logo">
          <img src="../IMG/DripLab_Logo.png">
        </div>
        <h1 class="lab-title">Tham gia Drip Lab</h1>
      </div>

      <form class="lab-form" @submit.prevent="handleRegister">

        <!-- Họ tên -->
        <div class="field-group">
          <label class="field-label">
            <span>Họ và tên</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="name" type="text" class="field-input"
              placeholder="Nguyễn Văn A" autocomplete="name"/>
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">
            <span>Email</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8 L12 14 L22 8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input v-model="email" type="email" class="field-input"
              placeholder="researcher@driplab.com" autocomplete="email"/>
          </div>
        </div>

        <!-- Số điện thoại -->
        <div class="field-group">
          <label class="field-label">
            <span>Số điện thoại</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input v-model="phone" type="tel" class="field-input"
              placeholder="0912 345 678" autocomplete="tel"/>
          </div>
        </div>

        <!-- Password -->
        <div class="field-group">
          <label class="field-label">
            <span>Mật khẩu</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 11 V7 A4 4 0 0 1 16 7 V11" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input v-model="password" :type="showPwd ? 'text' : 'password'"
              class="field-input" placeholder="••••••••" autocomplete="new-password"/>
            <button type="button" class="eye-btn" @click="showPwd = !showPwd" tabindex="-1">
              <svg v-if="!showPwd" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M1 1l22 22"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div v-if="password" class="strength-wrap">
            <div class="strength-bar">
              <div v-for="i in 4" :key="i" class="strength-seg"
                :style="{ background: i <= strength ? strengthColor : 'rgba(139,94,60,0.12)' }">
              </div>
            </div>
            <span class="strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          </div>
        </div>

        <!-- Confirm -->
        <div class="field-group">
          <label class="field-label">
            <span>Xác nhận mật khẩu</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input v-model="confirm" :type="showCfm ? 'text' : 'password'"
              class="field-input" :class="{ mismatch: confirm && confirm !== password }"
              placeholder="••••••••" autocomplete="new-password"/>
            <button type="button" class="eye-btn" @click="showCfm = !showCfm" tabindex="-1">
              <svg v-if="!showCfm" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M1 1l22 22"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <p v-if="confirm && confirm !== password" class="mismatch-hint">✗ Mật khẩu không khớp</p>
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
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Đăng ký
          </span>
          <span v-else class="btn-loading">
            <span class="loading-dots"><span></span><span></span><span></span></span>
            Processing...
          </span>
        </button>

      </form>

      <div class="card-footer">
        <p class="footer-text">
          Đã có tài khoản?
          <button class="link-btn" @click="goLogin">Đăng nhập</button>
        </p>
        <button class="home-btn" @click="goHome">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L12 3l9 9M5 10v10h5v-6h4v6h5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Về trang chủ
        </button>
      </div>
    </div>

  </div>
</template>

<style src="./Auth.css"></style>
