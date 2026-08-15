import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total_price, status"),
      ]);
      if (error) throw error;
      return (profiles ?? []).map((profile) => {
        const mine = (orders ?? []).filter((o) => o.user_id === profile.id);
        return {
          ...profile,
          orders: mine.length,
          spent: mine
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + Number(o.total_price), 0),
        };
      });
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Customers</h1>
      <p className="mt-2 text-sm text-muted-foreground">Everyone who has signed up to Cloud Nine.</p>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass mt-6 overflow-x-auto rounded-3xl p-2">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-widest text-subtle uppercase">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Delivered value</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-semibold">{customer.full_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.email ?? "—"}</td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">{formatPrice(customer.spent)}</td>
                  <td className="px-4 py-3 text-subtle">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
