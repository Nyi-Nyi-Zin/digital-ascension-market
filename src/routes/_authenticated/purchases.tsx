import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, PAYMENT_METHODS } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/purchases")({
  component: PurchasesPage,
});

type PurchaseRow = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_method: string;
  rejection_reason: string | null;
  created_at: string;
  products: { name: string } | null;
  stock_items: { credential_data: string } | null;
};

function PurchasesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async (): Promise<PurchaseRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, quantity, total_price, status, payment_method, rejection_reason, created_at, products(name), stock_items(credential_data)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PurchaseRow[];
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          My <span className="gradient-text">purchases</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Track verification status and copy your delivered credentials.
        </p>

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="glass mt-10 rounded-3xl p-12 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lavender">
              <ShoppingBag className="size-6 text-primary" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Once you buy a product it will show up here.
            </p>
            <Button asChild variant="hero" className="mt-6">
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {data?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function OrderCard({ order }: { order: PurchaseRow }) {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const method = PAYMENT_METHODS.find((m) => m.value === order.payment_method);
  const credential = order.stock_items?.credential_data;

  async function copy() {
    if (!credential) return;
    await navigator.clipboard.writeText(credential);
    setCopied(true);
    toast.success("Credentials copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{order.products?.name ?? "Product"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString()} · {method?.label ?? order.payment_method}{" "}
            · Qty {order.quantity}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} />
          <p className="mt-2 text-sm font-bold">{formatPrice(order.total_price)}</p>
        </div>
      </div>

      {order.status === "delivered" ? (
        <div className="mt-5">
          <Button variant="soft" size="sm" onClick={() => setReveal((v) => !v)}>
            {reveal ? <EyeOff /> : <Eye />} {reveal ? "Hide details" : "View Details"}
          </Button>
          {reveal ? (
            <div className="mt-4 rounded-2xl bg-lavender-light/70 p-5">
              <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                Your credentials
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-background/80 p-4 font-mono text-xs whitespace-pre-wrap">
                {credential ?? "Credentials are being prepared — refresh in a moment."}
              </pre>
              {credential ? (
                <Button variant="outline" size="sm" className="mt-3" onClick={copy}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {order.status === "rejected" && order.rejection_reason ? (
        <p className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <strong className="font-semibold">Reason:</strong> {order.rejection_reason}
        </p>
      ) : null}

      {order.status === "pending" ? (
        <p className="mt-5 text-xs text-subtle">
          Awaiting manual payment verification — usually within 3 hours.
        </p>
      ) : null}
    </article>
  );
}
