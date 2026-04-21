import dripLabLogo from "../IMG/dripLab_Logo_Footer.png";

function isOpenNow(openHour = 8, closeHour = 22) {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();
    return total >= openHour * 60 && total < closeHour * 60;
}

export default {
    name: "ChooseStores",
    data() {
        return {
            locationText:
                "Quang Trung High School, Đường Quang Trung, Quang Trung, Hà Đông, Hanoi",
            query: "",
            selectedId: null,
            toastMessage: null,
            logoUrl: dripLabLogo,
            _toastTimer: null,
            _clockTimer: null,
            openStatus: {},
            stores: [
                {
                    id: "hn-hk",
                    code: "Drip Lab-Vincom Bà Triệu",
                    address: "191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội, Vietnam",
                    distanceKm: 2.5,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-th",
                    code: "Drip Lab-Thái Hà",
                    address: "Tòa nhà Viet Tower, 1 Thái Hà, Trung Liệt, Đống Đa, Hà Nội, Vietnam",
                    distanceKm: 4.8,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-cg",
                    code: "Drip Lab-Indochina Plaza",
                    address: "241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Vietnam",
                    distanceKm: 7.2,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-tx",
                    code: "Drip Lab-Aeon Mall Hà Đông",
                    address: "Khu Dân cư Hoàng Văn Thụ, Dương Nội, Hà Đông, Hà Nội, Vietnam",
                    distanceKm: 5.6,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-lb",
                    code: "Drip Lab-Aeon Mall Long Biên",
                    address: "27 Cổ Linh, Long Biên, Hà Nội, Vietnam",
                    distanceKm: 8.5,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-hd",
                    code: "Drip Lab-Xuân Diệu",
                    address: "27 Xuân Diệu, Tây Hồ, Hà Nội, Vietnam",
                    distanceKm: 8.5,
                    openHour: 8,
                    closeHour: 22,
                },
                {
                    id: "hn-gl",
                    code: "Drip Lab-Ocean Park",
                    address: "Khu đô thị Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội, Vietnam",
                    distanceKm: 11.8,
                    openHour: 8,
                    closeHour: 22,
                },
            ],
        };
    },
    computed: {
        filteredStores() {
            const q = String(this.query || "").trim().toLowerCase();
            const list = q
                ? this.stores.filter((s) =>
                      `${s.code} ${s.address}`.toLowerCase().includes(q)
                  )
                : this.stores;
            return list.map((s) => ({
                ...s,
                isOpen: this.openStatus[s.id] ?? false,
            }));
        },
    },
    mounted() {
        this._updateStatus();
        this._clockTimer = setInterval(() => this._updateStatus(), 30_000);
    },
    beforeUnmount() {
        if (this._toastTimer) window.clearTimeout(this._toastTimer);
        if (this._clockTimer) window.clearInterval(this._clockTimer);
    },
    methods: {
        _updateStatus() {
            const status = {};
            this.stores.forEach((s) => {
                status[s.id] = isOpenNow(s.openHour, s.closeHour);
            });
            this.openStatus = status;
        },
        toKm(value) {
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
        },
        selectStore(store) {
            if (!store.isOpen) return;

            this.selectedId = store.id;
            this.showToast(`Đã chọn: ${store.code}`);

            // Lưu cửa hàng đã chọn để Homepage dùng lại
            sessionStorage.setItem("selectedStore", JSON.stringify(store));

            this.$router.push({ path: "/homepage" });
        },
    },
};