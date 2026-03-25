<script setup>
import { useUserLayout } from '../JS-USER/InterfaceHomePage.js'

const {
    navItems,
    connectLinks,
    socialLinks,
    year,
    activeNav,
    clickNav,
    clickLogo,
    goToLogin,
    goToCart
} = useUserLayout()
</script>

<template>
    <div class="user-layout">

        <!-- HEADER -->
        <header class="header-wrapper">
            <div class="header-inner">

                <div class="header-logo" @click="clickLogo">
                    <img src="../IMG/DripLab_Logo.png" alt="Drip Lab" />
                </div>

                <nav class="header-nav">
                    <button
                        v-for="item in navItems"
                        :key="item.id"
                        :class="{ active: activeNav === item.id }"
                        @click="clickNav(item)"
                    >
                        {{ item.label }}
                    </button>
                </nav>

                <div class="header-actions">
                    <button @click="goToLogin">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </button>
                    <button @click="goToCart">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm5.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </button>
                </div>

            </div>
        </header>

        <!-- NỘI DUNG TRANG CON -->
        <main class="user-content">
            <RouterView />
        </main>

        <!-- FOOTER -->
        <footer class="footer-wrapper">
            <div class="footer-inner">

                <div class="footer-brand">
                    <img src="../IMG/DripLab_Logo.png" alt="Drip Lab" />
                    <p>Drip Lab - Coffee for your fresh start every day.</p>
                </div>

                <div class="footer-col">
                    <h4>Connect</h4>
                    <ul>
                        <li v-for="link in connectLinks" :key="link.id">
                            <button @click="clickNav(link)">{{ link.label }}</button>
                        </li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Contact Us</h4>
                    <p>
                        Email: contact@driplab.com<br />
                        Hotline: 036 363 6767<br />
                        Place at: Vietnam
                    </p>
                </div>

                <div class="footer-col">
                    <h4>Follow Us On</h4>
                    <div class="footer-social">
                        <a v-for="s in socialLinks" :key="s.label" :href="s.href" :title="s.label" target="_blank">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                <path :d="s.icon" fill="#FAF7F0" />
                            </svg>
                        </a>
                    </div>
                </div>

            </div>
            <div class="footer-bottom">
                <p>© {{ year }} Drip Lab. Space for coffee heads.</p>
            </div>
        </footer>

    </div>
</template>

<style src="../CSS-USER/InterfaceHomePage.CSS"></style>