<template>
  <div class="cs-page">
    <div class="cs-panel">

      <!-- Location bar — nằm trên cùng trong khung -->
      <div class="cs-topbar">
        <div class="cs-locationIcon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" stroke="currentColor" stroke-width="2" />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <p class="cs-locationText" :title="locationText">
          {{ locationText || 'Vị trí của bạn...' }}
        </p>
        <button class="cs-iconBtn" type="button" title="Xóa vị trí" @click="clearLocation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Main content -->
      <main class="cs-main">
        <h1 class="cs-title">Chọn cửa hàng</h1>

        <div class="cs-search">
          <span class="cs-searchIcon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="query"
            class="cs-searchInput"
            type="text"
            placeholder="Tìm theo tên / địa chỉ"
            autocomplete="off"
          />
        </div>

        <section class="cs-list">
          <button
            v-for="store in filteredStores"
            :key="store.id"
            class="cs-card"
            type="button"
            :class="{
              'is-selected': selectedId === store.id,
              'is-closed': !store.isOpen
            }"
            @click="selectStore(store)"
          >
            <div class="cs-cardRow">
              <div class="cs-logo" aria-hidden="true">
                <img class="cs-logoImg" :src="logoUrl" alt="Logo" />
              </div>
              <div class="cs-cardBody">
                <div class="cs-cardTitleRow">
                  <h2 class="cs-cardTitle">{{ store.code }}</h2>
                  <span v-if="selectedId === store.id" class="cs-chip">Đã chọn</span>
                </div>
                <p class="cs-cardAddr">{{ store.address }}</p>
              </div>
              <div class="cs-cardMeta">
                <p class="cs-distance">{{ toKm(store.distanceKm) }}</p>
                <p class="cs-status" :class="store.isOpen ? 'is-open' : 'is-closed'">
                  {{ store.isOpen ? 'Đang mở cửa' : 'Đang đóng cửa' }}
                </p>
              </div>
            </div>
          </button>

          <div v-if="filteredStores.length === 0" class="cs-empty">
            Không tìm thấy cửa hàng phù hợp.
          </div>
        </section>
      </main>

      <!-- Toast -->
      <transition name="cs-toast">
        <div v-if="toastMessage" class="cs-toast">{{ toastMessage }}</div>
      </transition>

    </div>
  </div>
</template>

<script src="../JS-USER/ChooseStores.js"></script>
<style src="../CSS-USER/ChooseStores.css"></style>