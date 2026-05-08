<template>
  <div class="cs-page">
    <div class="cs-panel">

      <!-- Location bar -->
      <div class="cs-topbar">
        <div class="cs-locationIcon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" stroke="currentColor" stroke-width="2" />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <!-- Chưa có vị trí: nút GPS -->
        <button
          v-if="!locationText && !locating"
          class="cs-locateBtn"
          type="button"
          @click="detectLocation"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Dùng vị trí hiện tại
        </button>

        <!-- Đang lấy GPS -->
        <span v-else-if="locating" class="cs-locatingText">
          <span class="cs-spinner" aria-hidden="true"></span>
          Đang xác định vị trí...
        </span>

        <!-- Đã có vị trí -->
        <p v-else class="cs-locationText" :title="locationText">
          {{ locationText }}
        </p>

        <button
          v-if="locationText && !locating"
          class="cs-iconBtn"
          type="button"
          title="Xóa vị trí"
          @click="clearLocation"
        >
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
            :id="`store-card-${store.id}`"
            :class="{
              'is-selected': selectedId === store.id,
              'is-nearest': nearestSuggestedId === store.id,
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
                  <span v-if="nearestSuggestedId === store.id" class="cs-chip cs-chip--nearest">Cửa hàng gần nhất</span>
                  <span v-else-if="selectedId === store.id" class="cs-chip">Đã chọn</span>
                </div>
                <p class="cs-cardAddr">{{ store.address }}</p>
              </div>
              <div class="cs-cardMeta">
                <p class="cs-distance">{{ toKm(store.distanceKm) }}</p>
                <p class="cs-status" :class="store.isClosingSoon ? 'is-closing' : (store.isOpen ? 'is-open' : 'is-closed')">
                  <span v-if="store.isOpen">
                    <template v-if="store.isClosingSoon">
                      Cửa hàng sắp đóng cửa, Hiện chỉ phục vụ tại quán đến {{ store.closeTime }}
                    </template>
                    <template v-else>
                      Đang mở cửa
                    </template>
                  </span>
                  <span v-else>Đang đóng cửa</span>
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

    <!-- Closed Store Modal -->
    <transition name="cs-modal">
      <div v-if="showClosedModal" class="cs-modal-overlay" @click.self="showClosedModal = false">
        <div class="cs-modal">
          <div class="cs-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#ff6b6b" />
              <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span class="cs-modal-badge">CLOSE</span>
          </div>
          <h2 class="cs-modal-title">Cửa hàng đang đóng cửa</h2>
          <p class="cs-modal-desc">Cửa hàng đang đóng cửa, không thể đặt giao ngay.</p>
          <button class="cs-modal-btn" @click="showClosedModal = false">Đã hiểu</button>
        </div>
      </div>
    </transition>

    <!-- Far Distance Modal (>5km) -->
    <transition name="cs-modal">
      <div v-if="showFarModal" class="cs-modal-overlay" @click.self="closeFarModal">
        <div class="cs-modal cs-modal--far">
          <div class="cs-modal-icon">
            <div class="cs-hourglass" aria-hidden="true">⏳</div>
            <span class="cs-modal-badge cs-modal-badge--warn">LƯU Ý</span>
          </div>
          <h2 class="cs-modal-title">Khoảng cách vận chuyển khá xa</h2>
          <p class="cs-modal-desc">
            Vì quãng đường vận chuyển khá xa, Drip Lab lo lắng chất lượng hương vị sẽ không còn ở mức 100% khi đến tay bạn.
            Bạn vẫn muốn tiếp tục đặt hàng hay ghé qua cửa hàng để chúng mình được phục vụ bạn tốt nhất?
          </p>

          <div class="cs-modal-actions">
            <button class="cs-modal-btn" @click="confirmContinueOrder">Tiếp tục đặt đơn</button>
            <button class="cs-modal-btn cs-modal-btn--secondary" @click="goNearestStore">Ghé cửa hàng gần nhất</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reject Distance Modal (>10km) -->
    <transition name="cs-modal">
      <div v-if="showRejectModal" class="cs-modal-overlay" @click.self="closeRejectModal">
        <div class="cs-modal cs-modal--reject">
          <div class="cs-modal-icon">
            <div class="cs-hourglass cs-hourglass--reject" aria-hidden="true">⏳</div>
            <span class="cs-modal-badge cs-modal-badge--reject">RẤT TIẾC</span>
          </div>
          <h2 class="cs-modal-title">Hiện chưa thể giao hàng</h2>
          <p class="cs-modal-desc">
            Để đảm bảo chất lượng đồ uống không bị ảnh hưởng bởi quãng đường dài, Drip Lab chưa thể giao hàng đến vị trí của bạn lúc này.
          </p>
          <button class="cs-modal-btn" @click="ackReject">Đã hiểu</button>
        </div>
      </div>
    </transition>

    <!-- Thanks Modal (sau khi bấm Đã hiểu) -->
    <transition name="cs-modal">
      <div v-if="showThanksModal" class="cs-modal-overlay" @click.self="closeThanksModal">
        <div class="cs-modal cs-modal--thanks">
          <div class="cs-thanks-logoWrap" aria-hidden="true">
            <img class="cs-thanks-logo" :src="logoUrl" alt="Drip Lab" />
          </div>
          <h2 class="cs-modal-title">Cảm ơn bạn</h2>
          <p class="cs-modal-desc">
            Drip Lab chân thành cảm ơn sự quan tâm của bạn. Hãy ghé thăm cửa hàng gần nhất để trải nghiệm không gian và hương vị nguyên bản nhất nhé!
          </p>
          <button class="cs-modal-btn" @click="closeThanksModal" style="display:none">Đã hiểu</button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script src="../JS-USER/ChooseStores.js"></script>
<style src="../CSS-USER/ChooseStores.css"></style>
