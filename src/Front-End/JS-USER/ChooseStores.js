import dripLabLogo from "../IMG/dripLab_Logo_Footer.png";

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
            stores: [
                {
                    id: "hn-hk",
                    code: "Drip Lab-Vincom Bà Triệu",
                    address: "191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội, Vietnam",
                    distanceKm: 2.5,
                    isOpen: true,
                },
                {
                    id: "hn-th",
                    code: "Drip Lab-Thái Hà",
                    address: "Tòa nhà Viet Tower, 1 Thái Hà, Trung Liệt, Đống Đa, Hà Nội, Vietnam",
                    distanceKm: 4.8,
                    isOpen: true,
                },
                {
                    id: "hn-cg",
                    code: "Drip Lab-Indochina Plaza",
                    address: "241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Vietnam",
                    distanceKm: 7.2,
                    isOpen: true,
                },
                {
                    id: "hn-tx",
                    code: "Drip Lab-Aeon Mall Hà Đông",
                    address: "Khu Dân cư Hoàng Văn Thụ, Dương Nội, Hà Đông, Hà Nội, Vietnam",
                    distanceKm: 5.6,
                    isOpen: true,
                },
                {
                    id: "hn-lb",
                    code: "Drip Lab-Aeon Mall Long Biên",
                    address: "27 Cổ Linh, Long Biên, Hà Nội, Vietnam",
                    distanceKm: 8.5,
                    isOpen: true,
                },
                {
                    id: "hn-hd",
                    code: "Drip Lab-Xuân Diệu",
                    address: "27 Xuân Diệu, Tây Hồ, Hà Nội, Vietnam",
                    distanceKm: 8.5,
                    isOpen: true,
                },
                {
                    id: "hn-gl",
                    code: "Drip Lab-Ocean Park",
                    address: "Khu đô thị Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội, Vietnam",
                    distanceKm: 11.8,
                    isOpen: false,
                },
            ],
        };
    },
    computed: {
        filteredStores() {
            const q = String(this.query || "").trim().toLowerCase();
            if (!q) return this.stores;
            return this.stores.filter((s) => {
                const hay = `${s.code} ${s.address}`.toLowerCase();
                return hay.includes(q);
            });
        },
    },
    beforeUnmount() {
        if (this._toastTimer) {
            window.clearTimeout(this._toastTimer);
            this._toastTimer = null;
        }
    },
    methods: {
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
            if (!store.isOpen) return; // không cho chọn cửa hàng đóng cửa

            this.selectedId = store.id;
            this.showToast(`Đã chọn: ${store.code}`);

            // (Tuỳ chọn) Lưu cửa hàng đã chọn để Homepage dùng lại
            // Bạn có thể chỉ lưu store.id nếu muốn nhẹ hơn
            sessionStorage.setItem('selectedStore', JSON.stringify(store));

           
            this.$router.push({ path: '/homepage' });

        },
    },
};