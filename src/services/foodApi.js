//file to hold all functions related to FoodApis
//function to search food by query
//used the openfoodfacts api
export async function searchFoods(query) {
  if (query.trim() === "") {
    return [];
  }

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Open Food Facts API request failed with status ${response.status}`,
    );
  }
  //parse the JSON body after checking if response is okay
  //map over the data.products
  const data = await response.json();
  const items = data.products.map((item) => ({
    name: item.product_name ?? "Unknown",
    calories: item.nutriments?.["energy-kcal_100g"] ?? 0,
    protein: item.nutriments?.["proteins_100g"] ?? 0,
    carbs: item.nutriments?.["carbohydrates_100g"] ?? 0,
    fat: item.nutriments?.["fat_100g"] ?? 0,
  }));

  return items;
}
