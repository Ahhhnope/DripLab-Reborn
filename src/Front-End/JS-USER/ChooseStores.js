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
            toastMessage: null,
            showClosedModal: false,
            logoUrl: dripLabLogo,
            _toastTimer: null,
            _clockTimer: null,
            userLat: null,
            userLng: null,
            stores: [
                {
                    id: "hn-hk",
                    db_id: 1,                          // ID tương ứng trong bảng stores (SQL)
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
    },
    mounted() {
        this._clockTimer = setInterval(() => {
            this.nowTick = Date.now();
        }, 60_000);
    },
    beforeUnmount() {
        if (this._toastTimer) window.clearTimeout(this._toastTimer);
        if (this._clockTimer) window.clearInterval(this._clockTimer);
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
        },

        selectStore(store) {
            if (!store.isOpen) {
                this.showClosedModal = true;
                return;
            }
            this.selectedId = store.id;
            this.showToast(`Đã chọn: ${store.code}`);
            sessionStorage.setItem("selectedStore", JSON.stringify(store));

            // Navigate sang trang chi tiết cửa hàng, truyền db_id qua query param
            this.$router.push({ path: "/stores", query: { id: store.db_id } });
        },
    },
};