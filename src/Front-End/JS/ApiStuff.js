import api from '../../api/axios'

export async function getDrinks() {
  const res = await api.get("/drinks/all");
  return res.data;
}

export async function addDrink(drink) {
  const res = await api.post('/drinks/add', {
    name: drink.name,
    category: drink.category,
    basePrice: parseFloat(drink.basePrice),
    description: drink.description,
    imageUrl: drink.imageUrl,
    coffeeBeanId: drink.coffeeBeanId ? parseInt(drink.coffeeBeanId) : null,
    milkId: drink.milkId ? parseInt(drink.milkId) : null,
    heavyCreamId: drink.heavyCreamId ? parseInt(drink.heavyCreamId) : null,
    iceCreamId: drink.iceCreamId ? parseInt(drink.iceCreamId) : null,
    instructionId: drink.instructionId ? parseInt(drink.instructionId) : null,
  });
}

export async function updateDrink(drink) {
  await api.put(`/drinks/update/${drink.id}`, {
    name: drink.name,
    category: drink.category,
    basePrice: parseFloat(drink.basePrice),
    description: drink.description,
    imageUrl: drink.imageUrl,
    coffeeBeanId: drink.coffeeBeanId ? parseInt(drink.coffeeBeanId) : null,
    milkId: drink.milkId ? parseInt(drink.milkId) : null,
    heavyCreamId: drink.heavyCreamId ? parseInt(drink.heavyCreamId) : null,
    iceCreamId: drink.iceCreamId ? parseInt(drink.iceCreamId) : null,
    instructionId: drink.instructionId ? parseInt(drink.instructionId) : null,
  });
}

export async function toggleDrinks(id) {
  await api.put(`/drinks/toggle/${id}`);
}



//Upload ảnh
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post('/upload/image', formData);

  return res.data.imageUrl; // trả về "/IMG/uuid.jpg"
}



//Thành phần
// gotta catch them all
export async function getCoffeeBeans() {
  return (await api.get('/ingredients/coffee-beans')).data;
}

export async function getMilks() {
  return (await api.get('/ingredients/milks')).data;
}

export async function getHeavyCreams() {
  return (await api.get('/ingredients/heavy-creams')).data;
}

export async function getIceCreams() {
  return (await api.get('/ingredients/ice-creams')).data;
}

export async function getInstructions() {
  return (await api.get('/instructions')).data;
}