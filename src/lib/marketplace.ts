import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PREVIEW_CATEGORIES, PREVIEW_PRODUCTS } from "@/lib/previewCatalog";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number;
  image_url: string | null;
  what_you_get: string;
  is_active: boolean;
  created_at: string;
  is_mock?: boolean;
};

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  payment_method: string;
  transaction_note: string | null;
  payment_screenshot_url: string | null;
  status: string;
  rejection_reason: string | null;
  stock_item_id: string | null;
  created_at: string;
  updated_at: string;
};

export const PAYMENT_METHODS = [
  {
    value: "kbzpay",
    label: "KBZPay",
    account: "09675507310",
    holder: "Nyi Nyi Zin",
    note: "Transfer the exact MMK amount to the KBZPay number above and keep your receipt.",
  },
  {
    value: "wavepay",
    label: "WavePay",
    account: "0955 111 8899",
    holder: "Cloud Nine Digital",
    note: "Send the exact amount and keep your receipt.",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    account: "KBZ Bank · 1234 5678 9012",
    holder: "Cloud Nine Digital Co., Ltd",
    note: "Include your email in the transfer remark.",
  },
] as const;

export function formatPrice(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

/** Temporary display-only count used while real credential stock is unavailable. */
export function previewStockCount(productId: string) {
  let hash = 0;
  for (const character of productId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return 2 + (hash % 8);
}

export function whatYouGetList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) {
      console.error("Failed to load categories:", error);
      return PREVIEW_CATEGORIES;
    }
    return data && data.length > 0 ? (data as Category[]) : PREVIEW_CATEGORIES;
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to load products:", error);
      return PREVIEW_PRODUCTS;
    }
    return data && data.length > 0 ? (data as Product[]) : PREVIEW_PRODUCTS;
  },
});

export const stockCountsQuery = queryOptions({
  queryKey: ["stock-counts"],
  queryFn: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase.rpc("get_stock_counts");
    if (error) {
      console.error("Failed to load stock counts:", error);
      return {};
    }
    const map: Record<string, number> = {};
    for (const row of (data ?? []) as { product_id: string; available_count: number }[]) {
      map[row.product_id] = Number(row.available_count);
    }
    return map;
  },
});

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("Failed to load product:", error);
        return PREVIEW_PRODUCTS.find((product) => product.id === id) ?? null;
      }
      return (
        (data as Product | null) ?? PREVIEW_PRODUCTS.find((product) => product.id === id) ?? null
      );
    },
  });
}
