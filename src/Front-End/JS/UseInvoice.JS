import { ref } from "vue"
import axios from "axios"

const invoices = ref([])

async function loadInvoices(){
  const res = await axios.get("http://localhost:8080/invoices")
  invoices.value = res.data
}

export { invoices, loadInvoices }