<script setup>
import { ref, onMounted, computed } from "vue";
import {
    getDrinks, addDrink, updateDrink, toggleDrinks,
    getCoffeeBeans, getMilks, getHeavyCreams, getIceCreams, getInstructions,
    uploadImage
} from "../JS/ApiStuff";

const drinks = ref([]);

const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedDrink = ref(null);

const coffeeBeans = ref([]);
const milks = ref([]);
const heavyCreams = ref([]);
const iceCreams = ref([]);
const instructions = ref([]);

const errors = ref({
    name: '',
    basePrice: '',
    description: '',
    imageUrl: '',
});

// ── Confirm modal ──────────────────────────────────────────
const showConfirmModal = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

function openConfirm(message, action) {
    confirmMessage.value = message;
    confirmAction.value = action;
    showConfirmModal.value = true;
}

function closeConfirm() {
    showConfirmModal.value = false;
    confirmAction.value = null;
}

async function doConfirm() {
    if (confirmAction.value) await confirmAction.value();
    closeConfirm();
}
// ──────────────────────────────────────────────────────────

function validateNewDrink() {
    let valid = true;
    errors.value = { name: '', basePrice: '', description: '', imageUrl: '' };

    if (!newDrink.value.name.trim()) {
        errors.value.name = 'Vui lòng nhập tên sản phẩm!';
        valid = false;
    }
    if (!newDrink.value.basePrice || newDrink.value.basePrice <= 0) {
        errors.value.basePrice = 'Vui lòng nhập giá lớn hơn 0!';
        valid = false;
    }
    if (!newDrink.value.description.trim()) {
        errors.value.description = 'Vui lòng nhập mô tả!';
        valid = false;
    }
    if (!newDrink.value.imageUrl) {
        errors.value.imageUrl = 'Vui lòng chọn ảnh sản phẩm!';
        valid = false;
    }
    return valid;
}

// Thêm mới — validate trước rồi mở confirm
function requestCreateDrink() {
    if (!validateNewDrink()) return;
    openConfirm('Xác nhận thêm sản phẩm mới?', createDrink);
}

async function createDrink() {
    try {
        await addDrink(newDrink.value);
        showAddModal.value = false;
        loadDrinks();
    } catch (e) {
        alert("Lỗi: " + e.message);
    }
}

// Sửa — mở confirm
function requestSaveDrink(drink) {
    openConfirm('Xác nhận lưu thay đổi?', () => saveDrink(drink));
}

async function saveDrink(drink) {
    await updateDrink(drink);
    showEditModal.value = false;
    loadDrinks();
}

// Bật/Tắt — mở confirm
function requestToggleDrink(id, isActive) {
    const msg = isActive ? 'Xác nhận tạm dừng sản phẩm?' : 'Xác nhận mở bán sản phẩm?';
    openConfirm(msg, () => toggleDrink(id));
}

async function toggleDrink(id) {
    await toggleDrinks(id);
    loadDrinks();
}

function getImageUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:8080${url}`;
}

const newDrink = ref({
    name: "",
    category: "Cà phê",
    basePrice: 0,
    description: "",
    imageUrl: "",
    coffeeBeanId: null,
    milkId: null,
    heavyCreamId: null,
    iceCreamId: null,
    instructionId: null,
});

async function loadDrinks() {
  drinks.value = await getDrinks();
  currentPage.value = 1;
}

async function loadIngredients() {
    [coffeeBeans.value, milks.value, heavyCreams.value, iceCreams.value, instructions.value] =
        await Promise.all([getCoffeeBeans(), getMilks(), getHeavyCreams(), getIceCreams(), getInstructions()]);
}

function openAddModal() {
    newDrink.value = {
        name: "", category: "Cà phê", basePrice: 0,
        description: "", imageUrl: "",
        coffeeBeanId: null, milkId: null, heavyCreamId: null,
        iceCreamId: null, instructionId: null,
    };
    showAddModal.value = true;
}

function openEdit(drink) {
    selectedDrink.value = {
        ...drink,
        coffeeBeanId: drink.coffeeBean?.id ?? null,
        milkId: drink.milk?.id ?? null,
        heavyCreamId: drink.heavyCream?.id ?? null,
        iceCreamId: drink.iceCream?.id ?? null,
        instructionId: drink.instruction?.id ?? null,
    }
    showEditModal.value = true;
}

function closeModal() {
    showAddModal.value = false;
    showEditModal.value = false;
}

async function handleImageUpload(event, target) {
    const file = event.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (target === "new") newDrink.value.imageUrl = url;
    else selectedDrink.value.imageUrl = url;
}

onMounted(() => {
    loadDrinks();
    loadIngredients();
});

const currentPage = ref(1);
const pageSize = 10;

const sortedDrinks = computed(() => [...drinks.value].reverse());
const totalPages = computed(() => Math.ceil(sortedDrinks.value.length / pageSize));
const pagedDrinks = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return sortedDrinks.value.slice(start, start + pageSize);
});
</script>

<style scoped src="../CSS/Products.css"></style>

<template>
    <div class="page">
        <div class="page-header">
            <h2>Quản lý sản phẩm</h2>
            <button class="btn-add" @click="openAddModal">+ Thêm sản phẩm</button>
        </div>

        <table class="admin-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(drink, index) in pagedDrinks" :key="drink.id">
                    <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                    <td>SP_{{ drink.id }}</td>
                    <td>
                        <img v-if="drink.imageUrl" :src="getImageUrl(drink.imageUrl)" class="drink-thumb mx-auto" alt="ảnh" />
                        <span v-else class="no-img">—</span>
                    </td>
                    <td>{{ drink.name }}</td>
                    <td>{{ drink.category }}</td>
                    <td>{{ drink.basePrice?.toLocaleString('vi-VN') }}₫</td>
                    <td>{{ drink.active ? 'Đang bán' : 'Tạm Dừng' }}</td>
                    <td>
                        <button class="btn-icon-edit" @click="openEdit(drink)" title="Sửa">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>

                        <label class="toggle-switch" :title="drink.active ? 'Tắt' : 'Bật'">
                            <input type="checkbox" :checked="drink.active"
                                @change="requestToggleDrink(drink.id, drink.active)" />
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Phân trang -->
        <div class="pagination">
            <button @click="currentPage--" :disabled="currentPage === 1">‹</button>
            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                :class="{ active: currentPage === page }">{{ page }}</button>
            <button @click="currentPage++" :disabled="currentPage === totalPages">›</button>
        </div>

        <!-- MODAL THÊM -->
        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal">
                <h3>Thêm sản phẩm mới</h3>

                <div class="form-group">
                    <label>Tên sản phẩm</label>
                    <input v-model="newDrink.name" placeholder="Tên sản phẩm" />
                    <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <select v-model="newDrink.category">
                        <option value="Cà phê">Cà phê</option>
                        <option value="Trà">Trà</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Giá cơ bản (₫)</label>
                    <input type="number" v-model="newDrink.basePrice" />
                    <span v-if="errors.basePrice" class="error-msg">{{ errors.basePrice }}</span>
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <input v-model="newDrink.description" placeholder="Mô tả" />
                    <span v-if="errors.description" class="error-msg">{{ errors.description }}</span>
                </div>
                <div class="form-group">
                    <label>Ảnh sản phẩm</label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'new')" />
                    <span v-if="errors.imageUrl" class="error-msg">{{ errors.imageUrl }}</span>
                    <div v-if="newDrink.imageUrl" class="preview-wrap">
                        <img :src="getImageUrl(newDrink.imageUrl)" class="img-preview" />
                    </div>
                </div>

                <div class="ingredients-section">
                    <div class="ingredients-title">Thành phần</div>
                    <div class="form-group">
                        <label>Hạt cà phê</label>
                        <select v-model="newDrink.coffeeBeanId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in coffeeBeans" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sữa</label>
                        <select v-model="newDrink.milkId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in milks" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kem béo</label>
                        <select v-model="newDrink.heavyCreamId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in heavyCreams" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kem lạnh</label>
                        <select v-model="newDrink.iceCreamId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in iceCreams" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cách thức</label>
                        <select v-model="newDrink.instructionId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in instructions" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="btn-save" @click="requestCreateDrink">Thêm</button>
                    <button class="btn-cancel" @click="closeModal">Hủy</button>
                </div>
            </div>
        </div>

        <!-- MODAL SỬA -->
        <div v-if="showEditModal && selectedDrink" class="modal-overlay">
            <div class="modal">
                <h3>Sửa sản phẩm</h3>

                <div class="form-group">
                    <label>Tên sản phẩm</label>
                    <input v-model="selectedDrink.name" placeholder="Tên sản phẩm" />
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <input v-model="selectedDrink.category" placeholder="Danh mục" />
                </div>
                <div class="form-group">
                    <label>Giá cơ bản (₫)</label>
                    <input type="number" v-model="selectedDrink.basePrice" />
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <input v-model="selectedDrink.description" placeholder="Mô tả" />
                </div>
                <div class="form-group">
                    <label>Ảnh sản phẩm</label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'edit')" />
                    <div v-if="selectedDrink.imageUrl" class="preview-wrap">
                        <img :src="getImageUrl(selectedDrink.imageUrl)" class="img-preview" />
                    </div>
                </div>

                <div class="ingredients-section">
                    <div class="ingredients-title">Thành phần</div>
                    <div class="form-group">
                        <label>Hạt cà phê</label>
                        <select v-model="selectedDrink.coffeeBeanId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in coffeeBeans" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sữa</label>
                        <select v-model="selectedDrink.milkId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in milks" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kem béo</label>
                        <select v-model="selectedDrink.heavyCreamId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in heavyCreams" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kem lạnh</label>
                        <select v-model="selectedDrink.iceCreamId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in iceCreams" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cách thức</label>
                        <select v-model="selectedDrink.instructionId">
                            <option :value="null">-- Không chọn --</option>
                            <option v-for="item in instructions" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="btn-save" @click="requestSaveDrink(selectedDrink)">Lưu</button>
                    <button class="btn-cancel" @click="closeModal">Hủy</button>
                </div>
            </div>
        </div>

        <!-- MODAL XÁC NHẬN -->
        <div v-if="showConfirmModal" class="modal-overlay">
            <div class="confirm-modal">
                <div class="confirm-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                        viewBox="0 0 24 24" fill="none" stroke="#6b7280"
                        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <p class="confirm-message">{{ confirmMessage }}</p>
                <div class="confirm-buttons">
                    <button class="btn-confirm-ok" @click="doConfirm">Đồng ý</button>
                    <button class="btn-confirm-cancel" @click="closeConfirm">Hủy</button>
                </div>
            </div>
        </div>

    </div>
</template>