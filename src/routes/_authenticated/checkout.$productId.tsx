import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth";
import { formatPrice, productQuery, stockCountsQuery } from "@/lib/marketplace";
import { walletBalanceQuery } from "@/lib/wallet";

export const Route = createFileRoute("/_authenticated/checkout/$productId")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const { data: product, isLoading } = useQuery(productQuery(productId));
  const { data: stock } = useQuery(stockCountsQuery);
  const { data: wallet } = useQuery(walletBalanceQuery(user?.id));
  const [busy, setBusy] = useState(false);

  const available = stock?.[productId] ?? 0;
  const total = product?.price ?? 0;
  const balance = Number(wallet?.balance ?? 0);
  const canAfford = balance >= total;

  async function confirmOrder() {
    if (!product) return;
    setBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    toast.error(
      available > 0
        ? "Server error — please try again later. No units were deducted."
        : "Stock unavailable — no units were deducted.",
    );
    setBusy(false);
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Product unavailable</h1>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/products">Back to products</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to product
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold">Checkout with units</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Temporary purchase mode is active. Buy attempts do not deduct units or create orders.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="glass rounded-3xl p-7">
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-lavender">
                <WalletCards className="size-6 text-primary" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                  Your balance
                </p>
                <p className="mt-1 text-2xl font-extrabold">{balance.toFixed(2)} units</p>
              </div>
            </div>

            {!canAfford ? (
              <div className="mt-7 rounded-2xl border border-primary/20 bg-lavender-light/70 p-5">
                <p className="font-semibold">Insufficient balance</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You need {Math.max(total - balance, 0).toFixed(2)} more units before you can buy
                  this product.
                </p>
                <Button asChild variant="soft" className="mt-4">
                  <Link to="/units">Buy units</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl bg-lavender-light/70 p-5 text-sm">
                <p className="font-semibold">Purchase temporarily unavailable</p>
                <p className="mt-2 text-muted-foreground">
                  Try the button below to check availability. No units will be deducted while
                  temporary purchase mode is active.
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              <p>One unit equals one USD of product value.</p>
              <p className="mt-2">Units can be topped up with KBZPay, WavePay, or bank transfer.</p>
            </div>
          </section>

          <aside className="glass h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
              Order summary
            </h2>
            <p className="mt-4 text-base font-semibold">{product.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{available} available in stock</p>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Unit price</dt>
                <dd>{formatPrice(product.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Units used</dt>
                <dd>{total.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button
              variant="hero"
              size="lg"
              className="mt-6 w-full"
              onClick={confirmOrder}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : null}
              {busy ? "Checking availability…" : "Try purchase"}
            </Button>
            <p className="mt-3 text-center text-xs text-subtle">
              Temporary mode: this action never deducts units or creates a successful order.
            </p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
