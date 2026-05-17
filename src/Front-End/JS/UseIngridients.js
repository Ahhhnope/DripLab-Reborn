import { ref, computed, onMounted, nextTick } from "vue";
import api from "../../api/axios";

export function useIngredients(endpoint, idPrefix = "ITEM") {
  // --- Data State ---
  const rows = ref([]);
  const search = ref("");
  const currentPage = ref(1);
  const PAGE_SIZE = 8;

  // --- UI State ---
  const showForm = ref(false);
  const isEditing = ref(false);
  const showConfirm = ref(false);
  const deleteTarget = ref(null);
  const inputName = ref(null);

  // --- Toast State ---
  const toastShow = ref(false);
  const toastMsg = ref("");
  const toastType = ref("ok");

  // --- Form State ---
  const form = ref({
    id: "",
    tenLoai: "",
    gia: 0,
    ngayTao: null,
    ngayTaoDisp: ""
  });

  // --- Initialization ---
  const fetchData = async () => {
    try {
      // Endpoint would be 'ice-creams' or 'toppings'
      const res = await api.get(`/ingredients/${endpoint}`);
      rows.value = res.data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      showToast("Không thể kết nối máy chủ", "error");
    }
  };

  onMounted(fetchData);

  // --- Computed Logic ---
  const filtered = computed(() => {
    if (!search.value.trim()) return rows.value;
    return rows.value.filter(r =>
      r.name.toLowerCase().includes(search.value.toLowerCase())
    );
  });

  const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE));
  const pageStart = computed(() => (currentPage.value - 1) * PAGE_SIZE);
  const pagedRows = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE));
  const ghostCount = computed(() => Math.max(0, PAGE_SIZE - pagedRows.value.length));

  // --- Formatting Helpers ---
  const fmtPrice = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('vi-VN') : "---";

  // --- Actions ---
  const openAdd = () => {
    isEditing.value = false;
    form.value = {
      id: generateNextId(),
      tenLoai: "",
      gia: 0,
      ngayTao: new Date().toISOString(),
      ngayTaoDisp: new Date().toLocaleDateString('vi-VN')
    };
    showForm.value = true;
    nextTick(() => inputName.value?.focus());
  };

  const generateNextId = () => {
    if (!rows.value || rows.value.length === 0) {
      return "1"; // Start at 1 if the table is empty
    }

    let maxNum = 0;

    rows.value.forEach(row => {
      // Safely parse the existing ID to a number regardless of whether it's stored as a string or number
      const parsed = parseInt(row.id, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    });

    return String(maxNum + 1);
  };

  const openEdit = (row) => {
    isEditing.value = true;
    form.value = {
      id: row.id,
      tenLoai: row.name,
      gia: row.price,
      ngayTao: row.createdAt,
      ngayTaoDisp: new Date(row.createdAt).toLocaleDateString('vi-VN')
    };
    showForm.value = true;
    nextTick(() => inputName.value?.focus());
  };

  const submitForm = async () => {
    if (!form.value.tenLoai.trim()) return { error: "Vui lòng nhập tên!" };
    
    const payload = {
      name: form.value.tenLoai,
      price: parseFloat(form.value.gia)
    };

    try {
      if (isEditing.value) {
        await api.put(`/ingredients/update/${endpoint}/${form.value.id}`, payload);
      } else {
        await api.post(`/ingredients/add/${endpoint}`, payload);
      }
      await fetchData();
      showForm.value = false;
      return { success: isEditing.value ? "Cập nhật thành công!" : "Thêm mới thành công!" };
    } catch (error) {
      return { error: error.response?.data?.message || "Thao tác thất bại" };
    }
  };

  const openConfirm = (row) => {
    deleteTarget.value = { id: row.id, tenLoai: row.name };
    showConfirm.value = true;
  };

  const doDelete = async () => {
    try {
      await api.delete(`/ingredients/remove/${endpoint}/${deleteTarget.value.id}`);
      await fetchData();
      showConfirm.value = false;
      return { success: "Đã xóa thành công!" };
    } catch (error) {
      return { error: "Không thể xóa mục này" };
    }
  };

  const showToast = (msg, type = "ok") => {
    toastMsg.value = msg;
    toastType.value = type === "error" ? "err" : "ok";
    toastShow.value = true;
    setTimeout(() => { toastShow.value = false; }, 3000);
  };

  return {
    search, currentPage, PAGE_SIZE, pageStart,
    filtered, totalPages, pagedRows, ghostCount,
    fmtPrice, fmtDate,
    showForm, isEditing, inputName, form,
    openAdd, openEdit, submitForm,
    showConfirm, deleteTarget, openConfirm, doDelete,
    toastShow, toastMsg, toastType, showToast
  };
}