import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UNIT_MMK_RATE = 3663;

export type UnitBalance = {
  user_id: string;
  balance: number;
  updated_at: string;
};

export type UnitTopup = {
  id: string;
  user_id: string;
  unit_amount: number;
  mmk_amount: number;
  exchange_rate: number;
  payment_method: string;
  transaction_note: string;
  payment_screenshot_url: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export function mmkForUnits(units: number) {
  return Math.round(Number(units) * UNIT_MMK_RATE);
}

export function formatMMK(value: number) {
  return `${new Intl.NumberFormat("en-US").format(Math.round(value))} MMK`;
}

export function walletBalanceQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["unit-balance", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UnitBalance> => {
      if (!userId) return { user_id: "", balance: 0, updated_at: new Date(0).toISOString() };
      const { data, error } = await supabase
        .from("unit_balances")
        .select("user_id, balance, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (
        (data as UnitBalance | null) ?? {
          user_id: userId,
          balance: 0,
          updated_at: new Date(0).toISOString(),
        }
      );
    },
  });
}

export function unitTopupsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["unit-topups", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UnitTopup[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("unit_topups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UnitTopup[];
    },
  });
}
