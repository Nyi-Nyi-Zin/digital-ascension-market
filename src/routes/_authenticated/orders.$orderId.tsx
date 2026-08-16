import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, PAYMENT_METHODS } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { orderId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, products(name)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/purchases">My purchases</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const method = PAYMENT_METHODS.find((m) => m.value === data.payment_method);
  const methodLabel =
    data.payment_method === "units" ? "Cloud Nine units" : (method?.label ?? data.payment_method);
  const confirmationMessage =
    data.status === "delivered"
      ? "Your units were charged successfully and your digital credentials are ready."
      : "Thank you! We're checking your payment now.";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="glass rounded-3xl p-10 text-center">
          <span className="gradient-brand mx-auto flex size-16 items-center justify-center rounded-full shadow-glow">
            <CheckCircle2 className="size-7 text-primary-foreground" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">Order received</h1>
          <p className="mt-2 text-sm text-muted-foreground">{confirmationMessage}</p>

          <div className="mt-6 flex justify-center">
            <StatusBadge status={data.status} />
          </div>

          <dl className="mt-8 space-y-3 rounded-3xl bg-lavender-light/60 p-6 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Order ID</dt>
              <dd className="font-mono text-xs break-all">{data.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Product</dt>
              <dd className="font-semibold">
                {(data.products as { name: string } | null)?.name ?? "—"} × {data.quantity}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-semibold">{formatPrice(data.total_price)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Paid with</dt>
              <dd>{methodLabel}</dd>
            </div>
          </dl>

          <p className="mt-6 inline-flex items-center gap-2 text-xs text-subtle">
            <Clock className="size-4 text-primary" />
            {data.status === "delivered"
              ? "Your credentials are also available in My Purchases."
              : "Admin will verify your payment within 3 hours (max 24 hours)."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero">
              <Link to="/purchases">View my purchases</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/products">Keep shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
