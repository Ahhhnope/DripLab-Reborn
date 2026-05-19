import dripLabLogo from "../IMG/dripLab_Logo_Footer.png";

// Tính khoảng cách Haversine (km)
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Reverse geocode miễn phí bằng OpenStreetMap Nominatim
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

export default {
    name: "ChooseStores",
    data() {
        return {
            nowTick: Date.now(),
            locationText: "",
            locating: false,
            query: "",
            selectedId: null,
            nearestSuggestedId: null,
            toastMessage: null,
            showClosedModal: false,
            showClosingSoonModal: false,

            showFarModal: false,
            showRejectModal: false,
            showThanksModal: false,
            farDistanceThresholdKm: 5,
            rejectDistanceThresholdKm: 8,
            pendingStore: null,

            logoUrl: dripLabLogo,
            _toastTimer: null,
            _clockTimer: null,

            _scrollLocked: false,
            _scrollY: 0,
            userLat: null,
            userLng: null,
            stores: [
                {
                    id: "hn-hk",
                    db_id: 1,
                    code: "Drip Lab-Vincom Bà Triệu",
                    address: "191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội, Vietnam",
                    distanceKm: null,
                    lat: 21.0134, lng: 105.8497,
                    openTime: "08:00", closeTime: "22:00",
                },
                {
                    id: "hn-th",
                    db_id: 2,
                    code: "Drip Lab-Thái Hà",
                    address: "Tòa nhà Viet Tower, 1 Thái Hà, Trung Liệt, Đống Đa, Hà Nội, Vietnam",
                    distanceKm: null,
                    lat: 21.0197, lng: 105.8363,
                    openTime: "08:00", closeTime: "22:00",
                },
                {
                    id: "hn-cg",
                    db_id: 3,
                    code: "Drip Lab-Indochina Plaza",
                    address: "241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Vietnam",
                    distanceKm: null,
                    lat: 21.0380, lng: 105.7846,
                    openTime: "08:00", closeTime: "22:00",
                },
                {
                    id: "hn-tx",
                    db_id: 4,
                    code: "Drip Lab-Aeon Mall Hà Đông",
                    address: "Khu Dân cư Hoàng Văn Thụ, Dương Nội, Hà Đông, Hà Nội, Vietnam",
                    distanceKm: null,
                    lat: 20.9812, lng: 105.7469,
                    openTime: "08:00", closeTime: "22:00",
                },
                {
                    id: "hn-lb",
                    db_id: 5,
                    code: "Drip Lab-Aeon Mall Long Biên",
                    address: "27 Cổ Linh, Long Biên, Hà Nội, Vietnam",
                    distanceKm: null,
                    lat: 21.0486, lng: 105.9001,
                    openTime: "08:00", closeTime: "22:00",
                },
            ],
        };
    },
    computed: {
        isAnyModalOpen() {
            return !!(
                this.showClosedModal ||
                this.showClosingSoonModal ||
                this.showFarModal ||
                this.showRejectModal ||
                this.showThanksModal
            );
        },
        filteredStores() {
            this.nowTick;

            const q = String(this.query || "").trim().toLowerCase();
            let list = q
                ? this.stores.filter((s) =>
                    `${s.code} ${s.address}`.toLowerCase().includes(q)
                )
                : [...this.stores];

            if (this.userLat !== null) {
                list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
            }

            return list.map((s) => ({
                ...s,
                isOpen: this.isOpenNow(s.openTime, s.closeTime),
                isClosingSoon: this.isClosingSoon(s.openTime, s.closeTime),
            }));
        },
        closingSoonCloseTime() {
            const s = this.filteredStores.find((s) => s.isClosingSoon);
            return s ? s.closeTime : "4:00";
        },
    },
    watch: {
        isAnyModalOpen: {
            immediate: true,
            handler(val) {
                this._syncBodyScrollLock(!!val);
            },
        },
    },
    mounted() {
        localStorage.removeItem("selectedStore");
        localStorage.removeItem("selectedStoreId");
        sessionStorage.removeItem("selectedStore");
        sessionStorage.removeItem("selectedStoreId");

        this._clockTimer = setInterval(() => {
            this.nowTick = Date.now();
        }, 60_000);
    },
    beforeUnmount() {
        if (this._toastTimer) window.clearTimeout(this._toastTimer);
        if (this._clockTimer) window.clearInterval(this._clockTimer);
        this._syncBodyScrollLock(false);
    },
    methods: {
        isOpenNow(openTime, closeTime) {
            const now = new Date();
            const current = now.getHours() * 60 + now.getMinutes();
            const [oh, om] = openTime.split(":").map(Number);
            const [ch, cm] = closeTime.split(":").map(Number);
            return current >= oh * 60 + om && current < ch * 60 + cm;
        },

        isClosingSoon(openTime, closeTime) {
            const now = new Date();
            const current = now.getHours() * 60 + now.getMinutes();
            const [ch, cm] = closeTime.split(":").map(Number);
            const close = ch * 60 + cm;
            const diff = close - current;
            return diff <= 30 && diff > 0;
        },

        detectLocation() {
            if (!navigator.geolocation) {
                this.showToast("Trình duyệt không hỗ trợ GPS");
                return;
            }
            this.locating = true;
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    this.userLat = pos.coords.latitude;
                    this.userLng = pos.coords.longitude;
                    this._recalcDistances();
                    this.locationText = await reverseGeocode(this.userLat, this.userLng);
                    // ✅ Lưu địa chỉ GPS vào sessionStorage để Cart.js dùng
                    sessionStorage.setItem("userLocationText", this.locationText);
                    this.locating = false;
                },
                (err) => {
                    this.locating = false;
                    const msg = {
                        1: "Bạn đã từ chối quyền truy cập vị trí",
                        2: "Không xác định được vị trí",
                        3: "Hết thời gian chờ GPS",
                    }[err.code] || "Không lấy được vị trí";
                    this.showToast(msg);
                },
                { timeout: 10_000, maximumAge: 60_000, enableHighAccuracy: true }
            );
        },

        _recalcDistances() {
            if (this.userLat == null) return;
            this.stores = this.stores.map((s) => ({
                ...s,
                distanceKm: parseFloat(
                    haversine(this.userLat, this.userLng, s.lat, s.lng).toFixed(2)
                ),
            }));
        },

        toKm(value) {
            if (value == null) return "— km";
            const n = Number(value);
            if (Number.isFinite(n)) return `${n.toFixed(2)} km`;
            return "—";
        },

        showToast(message) {
            this.toastMessage = message;
            if (this._toastTimer) window.clearTimeout(this._toastTimer);
            this._toastTimer = window.setTimeout(() => {
                this.toastMessage = null;
                this._toastTimer = null;
            }, 2200);
        },

        clearLocation() {
            this.locationText = "";
            this.userLat = null;
            this.userLng = null;
            this.stores = this.stores.map((s) => ({ ...s, distanceKm: null }));
            // ✅ Xóa địa chỉ GPS khỏi sessionStorage khi user xóa vị trí
            sessionStorage.removeItem("userLocationText");
        },

        _syncBodyScrollLock(locked) {
            if (locked === this._scrollLocked) return;

            const body = document.body;
            const html = document.documentElement;

            if (locked) {
                this._scrollY = window.scrollY || 0;
                html.style.overflow = "hidden";
                body.style.overflow = "hidden";
                body.style.position = "fixed";
                body.style.top = `-${this._scrollY}px`;
                body.style.left = "0";
                body.style.right = "0";
                body.style.width = "100%";
            } else {
                html.style.overflow = "";
                body.style.overflow = "";
                body.style.position = "";
                body.style.top = "";
                body.style.left = "";
                body.style.right = "";
                body.style.width = "";
                window.scrollTo(0, this._scrollY || 0);
            }

            this._scrollLocked = locked;
        },

        // ===== Modal khoảng cách xa (>5km) =====
        closeFarModal() {
            this.showFarModal = false;
            this.pendingStore = null;
        },

        // ===== Modal từ chối giao (>10km) =====
        closeRejectModal() {
            this.showRejectModal = false;
            this.pendingStore = null;
        },

        ackReject() {
            this.closeRejectModal();
            this.showThanksModal = true;

            window.setTimeout(() => {
                this.showThanksModal = false;
            }, 3000);
        },

        closeThanksModal() {
            this.showThanksModal = false;
        },

        confirmContinueOrder() {
            if (!this.pendingStore) {
                this.closeFarModal();
                return;
            }
            const s = this.pendingStore;
            this.closeFarModal();
            this._applySelectionAndGoHome(s);
        },

        goNearestStore() {
            if (this.userLat == null) {
                this.showToast("Vui lòng bật vị trí để tìm cửa hàng gần nhất");
                this.closeFarModal();
                return;
            }

            const openStores = this.filteredStores.filter((s) => s.isOpen && s.distanceKm != null);
            if (openStores.length === 0) {
                this.showToast("Hiện không có cửa hàng nào đang mở");
                this.closeFarModal();
                return;
            }

            const nearest = [...openStores].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))[0];

            this.closeFarModal();

            this.nearestSuggestedId = nearest.id;
            this.selectedId = null;
            this.showToast(`Gợi ý cửa hàng gần nhất: ${nearest.code}`);

            this.$nextTick(() => {
                const el = document.getElementById(`store-card-${nearest.id}`);
                if (el && typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        },

        // ===== Flow chọn cửa hàng =====
        selectStore(store) {
            if (!store.isOpen) {
                this.showClosedModal = true;
                return;
            }

            if (store.isClosingSoon) {
                this.showClosingSoonModal = true;
                return;
            }

            const d = Number(store.distanceKm);
            if (Number.isFinite(d) && d > this.rejectDistanceThresholdKm) {
                this.pendingStore = store;
                this.showRejectModal = true;
                return;
            }

            if (Number.isFinite(d) && d > this.farDistanceThresholdKm) {
                this.pendingStore = store;
                this.showFarModal = true;
                return;
            }

            this._applySelectionAndGoHome(store);
        },

        _applySelectionAndGoHome(store) {
            this.selectedId = store.id;
            this.showToast(`Đã chọn: ${store.code}`);

            sessionStorage.setItem("selectedStore", JSON.stringify(store));
            sessionStorage.setItem("selectedStoreId", String(store.db_id));

            this.nearestSuggestedId = null;

            this.$router.push("/");
        },
    },
};