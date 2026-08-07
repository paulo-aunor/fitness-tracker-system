//file to hold all functions related to FoodApis
//function to search food by query
//used the openfoodfacts api
export async function searchFoods(query) {
  if (query.trim() === "") {
    return [];
  }

  // Using the v2 API here instead of the legacy cgi/search.pl endpoint --
  // the legacy endpoint doesn't send CORS headers, so browser fetch() calls
  // to it are always blocked. v2 supports CORS and returns the same
  // products/nutriments shape, so the mapping logic below didn't need to change.
  const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&fields=product_name,nutriments`;
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
    fiber: item.nutriments?.["fiber_100g"] ?? 0,
  }));

  return items;
}
