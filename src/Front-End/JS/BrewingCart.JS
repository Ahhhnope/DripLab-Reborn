import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBrewingCart = defineStore('brewingCart', () => {
  const pendingDrinks = ref([])

  function addBrewedDrink(drinkItem) {
    pendingDrinks.value.push(drinkItem)
  }

  function consumePendingDrinks() {
    const drinks = [...pendingDrinks.value]
    pendingDrinks.value = []
    return drinks
  }

  function hasPendingDrinks() {
    return pendingDrinks.value.length > 0
  }

  return { pendingDrinks, addBrewedDrink, consumePendingDrinks, hasPendingDrinks }
})