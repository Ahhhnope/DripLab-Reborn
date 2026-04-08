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

async function createDrink() {
    try {
        await addDrink(newDrink.value);
        showAddModal.value = false;
        loadDrinks();
    } catch (e) {
        alert("Lỗi: " + e.message);
    }
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

async function saveDrink(drink) {
    await updateDrink(drink);
    showEditModal.value = false;
    loadDrinks();
}

async function toggleDrink(id) {
    await toggleDrinks(id);
    loadDrinks();
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
                    <td>
                        <img v-if="drink.imageUrl" :src="`http://localhost:8080${drink.imageUrl}`" class="drink-thumb"
                            alt="ảnh" />
                        <span v-else class="no-img">—</span>
                    </td>
                    <td>{{ drink.name }}</td>
                    <td>{{ drink.category }}</td>
                    <td>{{ drink.basePrice?.toLocaleString('vi-VN') }}₫</td>
                    <td>{{ drink.active ? 'Đang bán' : 'Đã Tắt'}}</td> 
                    <td>
                        <button class="btn-edit" @click="openEdit(drink)">Sửa</button>
<<<<<<< HEAD
                        <button class="btn-delete" @click="removeDrink(drink.id)">Hết hàng</button>
=======
                        <button class="btn-delete" @click="toggleDrink(drink.id)">
                            {{ drink.active ? 'Tắt' : 'Bật' }}
                        </button>
>>>>>>> ad2540a82ca0b4ef844ad5a076925030707a4b96
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
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <input v-model="newDrink.category" placeholder="Danh mục" />
                </div>
                <div class="form-group">
                    <label>Giá cơ bản (₫)</label>
                    <input type="number" v-model="newDrink.basePrice" />
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <input v-model="newDrink.description" placeholder="Mô tả" />
                </div>
                <div class="form-group">
                    <label>Ảnh sản phẩm</label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'new')" />
                    <div v-if="newDrink.imageUrl" class="preview-wrap">
                        <img :src="`http://localhost:8080${newDrink.imageUrl}`" class="img-preview" />
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
                            <option v-for="item in instructions" :key="item.id" :value="item.id">{{ item.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="btn-save" @click="createDrink">Thêm</button>
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
                        <img :src="`http://localhost:8080${selectedDrink.imageUrl}`" class="img-preview" />
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
                            <option v-for="item in instructions" :key="item.id" :value="item.id">{{ item.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="btn-save" @click="saveDrink(selectedDrink)">Lưu</button>
                    <button class="btn-cancel" @click="closeModal">Hủy</button>
                </div>
            </div>
        </div>
    </div>
</template>