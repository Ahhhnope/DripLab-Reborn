import { ref } from 'vue';

export const bus = ref(0);

export function notifyInvoiceUpdate() {
  bus.value++;
}