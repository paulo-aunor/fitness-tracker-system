//file to hold all functions related to FoodApis
//function to search food by query
//used the openfoodfacts api
export async function searchFoods(query) {
  //return an empty list right away for a blank/whitespace query instead of hitting the api
  if (query.trim() === "") {
    return [];
  }

  //using the v2 api here, not the legacy cgi/search.pl endpoint
  //legacy endpoint has no CORS headers so browser fetch() calls to it always get blocked
  //v2 supports CORS and has the same products/nutriments shape so the mapping below didn't need to change
  const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&fields=product_name,nutriments`;
  const response = await fetch(url);
  //throws with the status code if the request failed, instead of failing silently
  if (!response.ok) {
    throw new Error(
      `Open Food Facts API request failed with status ${response.status}`,
    );
  }
  //parse the JSON body after checking if response is okay
  //map over the data.products
  const data = await response.json();
  //builds the cleaned array. item.nutriments can be missing entirely on some
  //products, so ?. is used before falling back with ?? on every field
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
