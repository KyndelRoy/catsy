import { supabase } from './supabase';

/** 
 * Data fetchers based on catsy_db_schema.sql 
 * Using the official @supabase/supabase-js client with the anon key.
 * RLS policies will be automatically enforced based on the active session.
 */

async function fetchFromTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*');

  if (error) {
    console.error(`Supabase API Error on ${tableName}:`, error);
    return [];
  }
  
  return data;
}

export async function fetchUsers() {
  return await fetchFromTable('users');
}

export async function fetchCategories() {
  return await fetchFromTable('categories');
}

export async function fetchProducts() {
  return await fetchFromTable('products');
}

export async function fetchMaterials() {
  return await fetchFromTable('raw_materials_inventory');
}

export async function fetchRecipes() {
  return await fetchFromTable('product_recipe');
}

export async function fetchTaxSettings() {
  return await fetchFromTable('tax_settings');
}

export async function fetchReservations() {
  return await fetchFromTable('reservations');
}

export async function fetchOrders() {
  return await fetchFromTable('orders');
}

export async function fetchTransactions() {
  return await fetchFromTable('transactions');
}

export async function fetchRewards() {
  return await fetchFromTable('rewards');
}

export async function fetchPointsClaimLog() {
  return await fetchFromTable('points_claim_log');
}

export async function fetchInventoryLogs() {
  return await fetchFromTable('inventory_logs');
}

export async function fetchActivityLogs() {
  return await fetchFromTable('activity_logs');
}

export async function fetchFeedbacks() {
  return await fetchFromTable('feedbacks');
}
