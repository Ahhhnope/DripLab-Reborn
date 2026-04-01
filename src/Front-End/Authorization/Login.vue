<script setup>
import { useLogin } from '../Authorization/Login.JS'

const {
  identifier,
  password,
  showPassword,
  isLoading,
  errorMsg,
  identifierType,
  handleLogin,
  goRegister,
  goHome,
} = useLogin()
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

    <!-- ── Card ── -->
    <div class="lab-card" :class="{ loading: isLoading }">

      <div class="card-header">
        <div class="lab-logo">
          <img src="../IMG/DripLab_Logo.png">
        </div>
        <h1 class="lab-title">Drip Lab</h1>
        <div class="lab-divider"><span>Chào bạn</span></div>
      </div>

      <form class="lab-form" @submit.prevent="handleLogin">

        <div class="field-group">
          <label class="field-label">
            <span>{{ identifierType === 'phone' ? 'Số điện thoại' : 'Email' }}</span>
            <span style="font-size:10px; color:rgba(139,94,60,0.45); font-weight:400; margin-left:auto;">hoặc số điện thoại</span>
          </label>
          <div class="field-input-wrap">
            <!-- Phone icon -->
            <svg v-if="identifierType === 'phone'" class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- Email icon -->
            <svg v-else class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8 L12 14 L22 8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input v-model="identifier"
              :type="identifierType === 'phone' ? 'tel' : 'email'"
              class="field-input"
              placeholder="Email hoặc số điện thoại"
              autocomplete="username"/>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">
            <span>Password</span>
          </label>
          <div class="field-input-wrap">
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 11 V7 A4 4 0 0 1 16 7 V11" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
            <input v-model="password" :type="showPassword ? 'text' : 'password'"
              class="field-input" placeholder="••••••••" autocomplete="current-password"/>
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            Đăng nhập
          </span>
          <span v-else class="btn-loading">
            <span class="loading-dots"><span></span><span></span><span></span></span>
            Brewing...
          </span>
        </button>

      </form>

      <div class="card-footer">
        <p class="footer-text">
          Chưa có tài khoản?
          <button class="link-btn" @click="goRegister">Đăng ký ngay</button>
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
