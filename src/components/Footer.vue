<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Column 1 - Logo & Description -->
      <div class="footer-col">
        <h3>
          <img
            src="/IMG/dripLab_Logo_Footer.png"
            class="footer-logo"
            alt="Drip Lab Footer Logo"
          />
        </h3>
        <p data-i18n="footer.description">
          Drip Lab - Coffee for your <br />
          fresh start every day.
        </p>
      </div>

      <!-- Column 2 - Navigation -->
      <div class="footer-col">
        <h4 data-i18n="footer.connect">Tsaheylu</h4>
        <ul>
          <li><a href="#" data-i18n="nav.menu">Menu</a></li>
          <li><a href="#" data-i18n="nav.about">About Us</a></li>
          <li><a href="#" data-i18n="nav.news">News</a></li>
          <li><a href="#" data-i18n="nav.stores">Stores</a></li>
        </ul>
      </div>

      <!-- Column 3 - Contact -->
      <div class="footer-col">
        <h4 data-i18n="footer.contact">Contact Us</h4>
        <p>Email: contact@driplab.com</p>
        <p>Hotline: 036 363 6767</p>
        <p data-i18n="footer.location">Place at: Việt Nam</p>
      </div>

      <!-- Column 4 - Social Media -->
      <div class="footer-col">
        <h4 data-i18n="footer.follow">Follow Us On</h4>
        <ul class="social-list">
          <li>
            <a
              href="https://www.instagram.com/drip_lab_space/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i class="fa-brands fa-instagram"></i>
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/profile.php?id=100053801825707"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i class="fa-brands fa-facebook-f"></i>
            </a>
          </li>
          <li>
            <a
              href="https://www.tiktok.com/@drip_lab_space"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <i class="fa-brands fa-tiktok"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom" data-i18n="footer.copyright">
      © 2025 Drip Lab. Space for coffee heads.
    </div>
  </footer>
</template>
<script>
const translations = {
  vi: {
    // Footer
    "footer.description": "Drip Lab - Coffee for your fresh start every day.",
    "footer.connect": "Kết nối",
    "footer.contact": "Liên hệ",
    "footer.location": "Địa điểm: Việt Nam",
    "footer.follow": "Theo dõi chúng tôi",
    "footer.copyright": "© 2025 Drip Lab. Space for coffee heads."
  },
  en: {
    // Footer
    "footer.description": "Drip Lab - Coffee for your fresh start every day.",
    "footer.connect": "Connect",
    "footer.contact": "Contact Us",
    "footer.location": "Place at: Vietnam",
    "footer.follow": "Follow Us On",
    "footer.copyright": "© 2025 Drip Lab. Space for coffee heads."
  }
};
document.addEventListener('DOMContentLoaded', function () {
  // Get elements
  const userProfileBtn = document.getElementById('user-profile-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const themeToggle = document.getElementById('theme-toggle-dropdown');
  const langButtons = document.querySelectorAll('.lang-btn');

  // Menu dropdown elements
  const menuDropdownWrapper = document.querySelector('.menu-dropdown-wrapper');
  const menuDropdown = document.getElementById('menu-dropdown');
  const menuOptions = document.querySelectorAll('.menu-option');

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'dropdown-overlay';
  document.body.appendChild(overlay);

  /*========== Toggle User Profile Dropdown ==========*/
  userProfileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isActive = userDropdown.classList.contains('active');

    if (isActive) {
      closeUserDropdown();
    } else {
      openUserDropdown();
    }
  });

  function openUserDropdown() {
    userDropdown.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeUserDropdown() {
    userDropdown.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /*========== Close dropdown when clicking outside ==========*/
  overlay.addEventListener('click', closeUserDropdown);

  document.addEventListener('click', function (e) {
    if (!userDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
      closeUserDropdown();
    }
  });

  // Prevent dropdown from closing when clicking inside
  userDropdown.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  /*========== Menu Dropdown Hover - AUTO SHOW/HIDE ==========*/
  // Menu dropdown tự động hiện khi hover, không cần click
  // CSS đã xử lý phần hover, JS chỉ cần handle click events

  /*========== Menu Options Click Handlers ==========*/
  menuOptions.forEach(option => {
    option.addEventListener('click', function (e) {
      // Xóa e.preventDefault() đi
      // Để link tự chuyển trang bình thường
      const href = this.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });

  /*========== Theme Toggle Functionality ==========*/
  const html = document.documentElement;

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.classList.add(currentTheme);

  // Update toggle switch state based on current theme
  if (currentTheme === 'dark') {
    themeToggle.classList.add('active');
  }

  // Theme toggle click handler
  themeToggle.addEventListener('click', function () {
    const isDark = html.classList.contains('dark');

    if (isDark) {
      html.classList.remove('dark');
      html.classList.add('light');
      themeToggle.classList.remove('active');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      themeToggle.classList.add('active');
      localStorage.setItem('theme', 'dark');
    }
  });

  /*========== Language Toggle Functionality ==========*/

  // Get current language from localStorage or default to 'vi'
  let currentLang = localStorage.getItem('language') || 'vi';

  // Set initial language
  setLanguage(currentLang);

  // Language button click handlers
  langButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  function setLanguage(lang) {
    currentLang = lang;

    // Update active state on buttons
    langButtons.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);

    // Apply translations
    applyTranslations(lang);

    // Save to localStorage
    localStorage.setItem('language', lang);
  }

  function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        // Kiểm tra nếu element có chứa icon (menu options)
        const span = element.querySelector('span');
        if (span) {
          // Chỉ thay đổi text trong span, giữ nguyên icon
          span.textContent = translations[lang][key];
        } else {
          // Các element thông thường không có icon
          element.textContent = translations[lang][key];
        }
      }
    });
  }

  /*========== Action Buttons ==========*/

  // Login button
  const loginBtn = document.querySelector('.btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      console.log('Login clicked');
      alert('Chức năng đăng nhập / Login function');
      closeUserDropdown();
    });
  }

  // Sign out button
  const registerBtn = document.querySelector('.btn-register');
  if (registerBtn) {
    registerBtn.addEventListener('click', function () {
      console.log('Register clicked');
      window.location.href = '../HTML-INTERFACE/Register.HTML';
      alert('Chức năng đăng ký / Register function');
      closeUserDropdown();
    });
  }
  
  /*========== Escape key to close dropdown ==========*/
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && userDropdown.classList.contains('active')) {
      closeUserDropdown();
    }
  });
});
</script>
<style>
/*=============== GOOGLE FONTS ===============*/
@import url("https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800;900&display=swap");

/*=============== CSS VARIABLES ===============*/
:root {
  /* Color Palette - LIGHT MODE */
  --first-color: #b8906a;
  --first-color-alt: #a17d59;
  --hover-color: hsl(0, 0%, 95%);
  --title-color: #5c4033;
  --text-color: #999;
  --white-color: hsl(0, 0%, 100%);
  --border-color: #e0e0e0;
  --body-color: #f5f5f0;
  --header-bg: rgba(248, 248, 246, 0.85);
  --header-text: #3d2b1f;
  --footer-bg: #3d2b1f;
  --footer-text: #f5f5f0;
  --primary: #3b5e4a;
  --accent-gold: #c79a5e;
  --dark-brown: #3d2b1f;
  --background-light: #f8f8f6;

  /* Typography */
  --body-font: "Epilogue", sans-serif;
  --second-font: "Epilogue", sans-serif;
  --header-font: "Epilogue", sans-serif;
  
  /* Font Sizes */
  --bigger-font-size: 1.5rem;
  --normal-font-size: .938rem;
  --small-font-size: .875rem;

  /* Font Weights */
  --font-regular: 400;
  --font-semi-bold: 600;
  --font-black: 900;
}

/*=============== DARK MODE VARIABLES ===============*/
html.dark {
  /* Body, Header, Footer đổi màu theo theme */
  --body-color: #1a1714;
  --background-light: #1a1714;
  --title-color: #f5f5f0;
  --text-color: #c0c0c0;
  --border-color: #3d2b1f;
  --white-color: #2a2520;
  --header-bg: rgba(26, 23, 20, 0.85);
  --header-text: #f5f5f0;
  --footer-bg: #1a1714;
  --footer-text: #e0e0e0;
}

/*=============== RESPONSIVE TYPOGRAPHY ===============*/
@media screen and (min-width: 1150px) {
  :root {
    --bigger-font-size: 1.75rem;
    --normal-font-size: 1rem;
    --small-font-size: .938rem;
  }
}

/*=============== BASE RESET ===============*/
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}   

body {
  background: var(--body-color);
  font-family: var(--body-font);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/*=============== REUSABLE CLASSES ===============*/
.grid {
  display: grid;
  gap: 1.5rem;
}

input,
button {
  border: none;
  outline: none;
  font-family: var(--body-font);
  font-size: var(--normal-font-size);
}

a {
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}
.footer {
  background-color: var(--footer-bg);
  color: var(--footer-text);
  padding: 3rem 1.5rem 1.5rem;
  margin-top: 4rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-col h3 {
  margin-bottom: 1rem;
}

.footer-logo {
  width: 80px;
  height: auto;
  object-fit: contain;
}

.footer-col h4 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #c79a5e;
}

.footer-col p {
  font-size: 0.875rem;
  line-height: 1.8;
  color: var(--footer-text);
  transition: color 0.3s ease;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col ul li {
  margin-bottom: 0.75rem;
}

.footer-col ul li a {
  color: var(--footer-text);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.footer-col ul li a:hover {
  color: #c79a5e;
}

.social-list {
  display: flex;
  gap: 1rem;
}

.social-list li a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(199, 154, 94, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-list li a:hover {
  background-color: #c79a5e;
  transform: translateY(-3px);
}

.social-list li a i {
  font-size: 1.125rem;
  color: #f5f5f0;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(199, 154, 94, 0.3);
  font-size: 0.875rem;
  color: var(--footer-text);
  transition: color 0.3s ease;
}

/*===============================================*/
/*========== RESPONSIVE ==========*/
/*===============================================*/

/* Mobile - Header */
@media screen and (max-width: 768px) {
  .header-container {
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
  }
  
  .navbar {
    display: none;
  }
  
  .header-logo-img {
    height: 30px;
  }
  
  .user-login {
    gap: 1rem;
  }
  
  /* Mobile - User Dropdown */
  .user-dropdown {
    width: 300px;
    right: -10px;
  }
  
  .user-dropdown::before {
    right: 25px;
  }
  
  /* Mobile - Menu Dropdown */
  .menu-dropdown {
    min-width: 240px;
  }
}

/* Mobile - Footer */
@media screen and (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-list {
    justify-content: center;
  }
}

/* Very small screens */
@media screen and (max-width: 400px) {
  .user-dropdown {
    width: calc(100vw - 40px);
    right: -80px;
  }
  
  .dropdown-body {
    padding: 20px 16px; 
  }
  
  .dropdown-actions {
    flex-direction: column;
  }
  
  .menu-dropdown {
    min-width: 200px;
  }
}
</style>