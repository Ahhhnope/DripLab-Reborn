import { defineStore } from "pinia";
import api from "../api/axios";

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        loading: false
    }),
    getters: {
        totalPrice: (state) => {
        return state.items.reduce((total, item) => {
            const base = item.drink ? item.drink.basePrice : 0;
            const sizeExtra = item.size ? item.size.price : 0;
            const toppingTotal = item.toppings 
                ? item.toppings.reduce((sum, t) => sum + (t.topping.price || 0), 0) 
                : 0;
            
            return total + ((base + sizeExtra + toppingTotal) * item.quantity);
        }, 0);
    }
    },
    actions: {
        async fetchUserCart(userId) {
            this.loading = true;
            try {
                const cartRes = await api.get(`/carts/${userId}`);
                const cartId = cartRes.data.id;
                
                const itemRes = await api.get(`/carts/items/${cartId}`);
                this.items = itemRes.data;
            } catch (error) {
                console.error("lỗi load giỏ hàng: ", error);
            } finally {
                this.loading = false;
            }
        },

        async addToCart(payload) {
            try {
                await api.post('/carts/add', payload);
                await this.fetchUserCart(payload.userId);
            } catch (error) {
                console.error("lỗi thêm giỏ hàng: ", error);
            }
        }
    }
});