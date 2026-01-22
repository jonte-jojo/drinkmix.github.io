// src/data/productDB.ts
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

/**
 * Matches your DB columns exactly (snake/camel differences avoided by using the same names)
 */
export type ProductRow = {
  id: number; // bigint in DB, but in JS we treat it as number
  name: string | null;
  description: string | null;
  unitprice: number | null;
  caseprice: number | null;
  casesize: number | null;
  unitlabel: string | null;
  unit: string | null;
  category: string | null;
  image: string | null;
  hasAlcohol: boolean;
  alcohol_percent: number | null;
};

/**
 * If your frontend Product type uses camelCase, we map DB -> UI here.
 * IMPORTANT: Your current Product.id looks like string in your app.
 * DB id is number, so we convert to string.
 */
export function dbToProduct(row: ProductRow): Product {
  return {
    id: String(row.id),
    name: row.name ?? "",
    description: row.description ?? "",
    unitPrice: row.unitprice ?? 0,
    casePrice: row.caseprice ?? 0,
    caseSize: row.casesize ?? 0,
    unitLabel: row.unitlabel ?? "",
    unit: row.unit ?? "",
    category: (row.category ?? "") as Product["category"],
    image: row.image ?? "",
    hasAlcohol: row.hasAlcohol,
    alcoholPercent: row.alcohol_percent ?? null,
  };
}

/**
 * Map UI -> DB.
 * - If product.id is numeric string, we include it (for updates).
 * - If it's not numeric (like "p_..."), we omit id (DB will auto-generate).
 */
export function productToDb(product: Product): Omit<ProductRow, "id"> & Partial<Pick<ProductRow, "id">> {
  const maybeId = Number(product.id);
  const hasNumericId = Number.isFinite(maybeId) && String(maybeId) === String(product.id);

  const payload: any = {
    name: product.name,
    description: product.description,
    unitprice: product.unitPrice,
    caseprice: product.casePrice,
    casesize: product.caseSize,
    unitlabel: product.unitLabel,
    unit: product.unit,
    category: product.category,
    image: product.image,
    hasAlcohol: !!product.hasAlcohol,
    alcoholPercent: product.alcoholPercent ?? null,
  };

  if (hasNumericId) payload.id = maybeId;

  return payload;
}

/** Get all products */
export async function fetchProductsFromDB(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map(dbToProduct);
}

/**
 * Create or update a product.
 * - If product.id is numeric => update that row.
 * - If product.id is not numeric => insert new row.
 */
export async function saveProductToDB(product: Product): Promise<Product> {
  const payload = productToDb(product);

  // If it has numeric id -> update
  if (payload.id != null) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", payload.id)
      .select("*")
      .single();

    if (error) throw error;
    return dbToProduct(data as ProductRow);
  }

  // Otherwise insert new
  const { id, ...insertPayload } = payload;

  const { data, error } = await supabase
    .from("products")
    .insert([insertPayload])
    .select("*")
    .single();

  if (error) throw error;
  return dbToProduct(data as ProductRow);
}

/** Delete by DB id (numeric string in frontend) */
export async function deleteProductFromDB(productId: string): Promise<void> {
  const id = Number(productId);
  if (!Number.isFinite(id)) {
    throw new Error(`deleteProductFromDB: productId must be numeric. Got: ${productId}`);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
