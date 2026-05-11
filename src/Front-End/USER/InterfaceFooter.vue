<script setup>
import { useFooter } from '../JS-USER/InterfaceFooter.js'

const { connectLinks, socialLinks, year } = useFooter()
</script>

<template>
  <footer class="footer-wrapper">
    <div class="footer-inner">

      <div class="footer-brand">
        <img src="../IMG/DripLab_Logo.png" alt="Drip Lab" />
        <p>Drip Lab - Khởi đầu sảng khoái cùng cà phê tại Lab!!.</p>
      </div>

      <div class="footer-col">
        <h4>Liên kết</h4>
        <ul>
          <li v-for="link in connectLinks" :key="link.path">
            <RouterLink :to="link.path">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Liên hệ chúng tôi</h4>
        <p>
          Email: contact@driplab.com<br />
          Số điện thoại: 036 363 6767<br />
          Địa chỉ: 241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội
        </p>
      </div>

      <div class="footer-col">
        <h4>Theo dõi chúng tôi tại</h4>
        <div class="footer-social">
          <a v-for="s in socialLinks" :key="s.label" :href="s.href" :title="s.label" target="_blank">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path :d="s.icon" fill="#FAF7F0" />
            </svg>
          </a>
        </div>
      </div>

    </div>
    <div class="footer-bottom">
      <p>© {{ year }} Drip Lab. Không gian dành cho những người yêu cà phê.</p>
    </div>
  </footer>
</template>

<style src="../CSS-USER/InterfaceFooter.CSS"></style>