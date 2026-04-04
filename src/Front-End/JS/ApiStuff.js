const API = "http://localhost:8080";

export async function getDrinks() {
  const res = await fetch(`${API}/api/drinks`);
  return await res.json();
}

export async function addDrink(drink) {
  const res = await fetch(`${API}/api/drinks/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

export async function updateDrink(drink) {
  await fetch(`${API}/api/drinks/update/${drink.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: drink.name,
      category: drink.category,
      basePrice: parseFloat(drink.basePrice),  // ← thêm parseFloat
      description: drink.description,
      imageUrl: drink.imageUrl,
      coffeeBeanId: drink.coffeeBeanId ? parseInt(drink.coffeeBeanId) : null,
      milkId: drink.milkId ? parseInt(drink.milkId) : null,
      heavyCreamId: drink.heavyCreamId ? parseInt(drink.heavyCreamId) : null,
      iceCreamId: drink.iceCreamId ? parseInt(drink.iceCreamId) : null,
      instructionId: drink.instructionId ? parseInt(drink.instructionId) : null,
    }),
  });
}


// ---- Upload ảnh ----
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/api/upload/image`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data.imageUrl; // trả về "/IMG/uuid.jpg"
}

// ---- Thành phần ----
export async function getCoffeeBeans() {
  const res = await fetch(`${API}/api/ingredients/coffee-beans`);
  return await res.json();
}

export async function getMilks() {
  const res = await fetch(`${API}/api/ingredients/milks`);
  return await res.json();
}

export async function getHeavyCreams() {
  const res = await fetch(`${API}/api/ingredients/heavy-creams`);
  return await res.json();
}

export async function getIceCreams() {
  const res = await fetch(`${API}/api/ingredients/ice-creams`);
  return await res.json();
}

export async function getInstructions() {
  const res = await fetch(`${API}/api/instructions`);
  return await res.json();
}