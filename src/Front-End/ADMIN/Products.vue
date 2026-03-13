<script setup>
import "../CSS/Products.css";
import { ref, onMounted } from "vue";
import { getDrinks, addDrink, updateDrink, deleteDrink } from "../JS/ApiStuff";

const drinks = ref([]);
const newDrink = ref({
    name: "",
    basePrice: 0
});

async function loadDrinks() {
    drinks.value = await getDrinks();
};

async function createDrink() {
    await addDrink(newDrink.value);
    newDrink.value = {
        name: "",
        basePrice: 0
    };

    loadDrinks();
}

async function saveDrink(drink) {
    await updateDrink(drink);
    loadDrinks();
}

async function removeDrink(id) {
    await deleteDrink(id);
    loadDrinks();
}

onMounted(() => {
    loadDrinks();
})
</script>

<template>
    <div class="page">
        <h2>Quản lý sản phẩm</h2>

        <table class="admin-table">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Hành động</th>
                </tr>
            </thead>

            <tbody>

                <tr v-for="drink in drinks" :key="drink.id">
                    <td>{{ drink.id }}</td>

                    <td>{{ drink.name }}</td>

                    <td>{{ drink.basePrice }}</td>

                    <td>
                        <button @click="saveDrink(drink)">Update</button>
                        <button @click="removeDrink(drink.id)">Xóa</button>
                    </td>

                </tr>

            </tbody>
        </table>

        <h3>Thêm đồ uống</h3>

        <form @submit.prevent="createDrink">

            <input v-model="newDrink.name" placeholder="Name" />

            <input type="number" v-model="newDrink.basePrice" placeholder="Price" />

            <button type="submit">Add Drink</button>

        </form>
    </div>
</template>