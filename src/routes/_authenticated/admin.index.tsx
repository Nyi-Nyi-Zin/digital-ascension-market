import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, DollarSign, Loader2, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/site/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/marketplace";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

type Stats = { revenue: number; pending: number; products: number; customers: number };

function AdminDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<Stats> => {
      const { data, error } = await supabase.rpc("admin_stats");
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_price, created_at, products(name)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    {
      label: t("totalRevenue"),
      value: stats ? formatPrice(stats.revenue) : "—",
      icon: DollarSign,
    },
    { label: t("pendingOrders"), value: stats?.pending ?? "—", icon: Clock },
    { label: t("totalProducts"), value: stats?.products ?? "—", icon: Package },
    { label: t("totalCustomers"), value: stats?.customers ?? "—", icon: Users },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("dashboard")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("dashboardSummary")}
      </p>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="glass lift rounded-3xl p-6">
              <span className="gradient-brand flex size-11 items-center justify-center rounded-full shadow-glow">
                <card.icon className="size-5 text-primary-foreground" />
              </span>
              <p className="mt-4 text-2xl font-extrabold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass mt-8 rounded-3xl p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">{t("recentOrders")}</h2>
          <Button asChild variant="soft" size="sm">
            <Link to="/admin/orders">{t("reviewOrders")}</Link>
          </Button>
        </div>
        <ul className="mt-5 divide-y divide-border">
          {(recent ?? []).map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold">
                  {(order.products as { name: string } | null)?.name ?? t("product")}
                </p>
                <p className="text-xs text-subtle">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatPrice(order.total_price)}</span>
                <StatusBadge status={order.status} />
              </div>
            </li>
          ))}
          {(recent?.length ?? 0) === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">{t("noOrders")}</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
