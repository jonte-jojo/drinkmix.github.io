import { supabase } from "@/lib/supabase";
import type { Bilder } from "@/types/product";

type ProductImageRow = {
  id: number;
  name: string | null;
  image: string | null;
};

export async function fetchBilderFromProducts(): Promise<Bilder[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, image")
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name ?? "",
    image: row.image ?? "",
  })) as Bilder[];
}