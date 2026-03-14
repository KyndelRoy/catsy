const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Using Service Role key for the Admin dashboard to bypass Row Level Security
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Generic fetcher
async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Supabase API Error on ${url}:`, response.status, errorBody);
    throw new Error(`Supabase API request failed: ${response.statusText}`);
  }

  // Return null or data for 204 No Content
  if (response.status === 204) return null;
  return response.json();
}

/** 
 * Data fetchers based on catsy_db_schema.sql 
 * We use `select=*` to get all columns.
 */

export async function fetchUsers() {
  return await sbFetch("users?select=*");
}

export async function fetchCategories() {
  return await sbFetch("categories?select=*");
}

export async function fetchProducts() {
  return await sbFetch("products?select=*");
}

export async function fetchMaterials() {
  return await sbFetch("raw_materials_inventory?select=*");
}

export async function fetchRecipes() {
  return await sbFetch("product_recipe?select=*");
}

export async function fetchTaxSettings() {
  return await sbFetch("tax_settings?select=*");
}

export async function fetchReservations() {
  return await sbFetch("reservations?select=*");
}

export async function fetchOrders() {
  return await sbFetch("orders?select=*");
}

export async function fetchTransactions() {
  return await sbFetch("transactions?select=*");
}

export async function fetchRewards() {
  return await sbFetch("rewards?select=*");
}

export async function fetchPointsClaimLog() {
  return await sbFetch("points_claim_log?select=*");
}

export async function fetchInventoryLogs() {
  return await sbFetch("inventory_logs?select=*");
}

export async function fetchActivityLogs() {
  return await sbFetch("activity_logs?select=*");
}

export async function fetchFeedbacks() {
  return await sbFetch("feedbacks?select=*");
}
