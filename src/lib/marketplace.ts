import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const MOCK_CATEGORIES: Category[] = [
  { id: "mock-ai", name: "AI Subscriptions", slug: "ai-subscriptions", icon: "Sparkles" },
  { id: "mock-design", name: "Design Tools", slug: "design-tools", icon: "PenTool" },
  { id: "mock-streaming", name: "Streaming", slug: "streaming", icon: "Play" },
];

function withMockCategories(data: Category[] | null) {
  return data && data.length > 0 ? (data as Category[]) : MOCK_CATEGORIES;
}

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
    account: "0977 000 1234",
    holder: "Cloud Nine Digital",
    note: "Scan the QR or transfer to the number above.",
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
      return MOCK_CATEGORIES;
    }
    return withMockCategories(data as Category[]);
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
      return [];
    }
    return (data ?? []) as Product[];
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
        return null;
      }
      return (data as Product | null) ?? null;
    },
  });
}
