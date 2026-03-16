//test fetching cart from api

const API = "http://localhost:8080";

export async function getDrinks() {
  const res = await fetch(`${API}/api/drinks`);
  return await res.json();
};

export async function addDrink(drink) {
  await fetch(`${API}/api/drinks`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(drink)
  });
};

export async function updateDrink(drink) {
  await fetch(`${API}/api/drinks/${drink.id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(drink)
  });
};

export async function deleteDrink(id) {
  await fetch(`${API}/api/drinks/${id}`, {
    method: "DELETE"
  });
};