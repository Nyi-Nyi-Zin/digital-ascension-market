import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productQuery, stockCountsQuery } from "@/lib/marketplace";
import { walletBalanceQuery } from "@/lib/wallet";

export const Route = createFileRoute("/_authenticated/checkout/$productId")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const { t } = useI18n();
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
              available > 0 ? t("somethingWentWrong") : t("stockUnavailable"),

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
          <h1 className="text-2xl font-bold">{t("noProducts")}</h1>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/products">{t("products")}</Link>
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
          <ArrowLeft className="size-4" /> {t("product")}
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold">{t("checkoutWithUnits")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("temporaryPurchaseMode")}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="glass rounded-3xl p-7">
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-lavender">
                <WalletCards className="size-6 text-primary" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                  {t("balance")}
                </p>
                <p className="mt-1 text-2xl font-extrabold">{balance.toFixed(2)} {t("units")}</p>
              </div>
            </div>

            {!canAfford ? (
              <div className="mt-7 rounded-2xl border border-primary/20 bg-lavender-light/70 p-5">
                <p className="font-semibold">{t("insufficientBalance")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {Math.max(total - balance, 0).toFixed(2)} {t("units")} {t("unitsRequired")}.
                </p>
                <Button asChild variant="soft" className="mt-4">
                  <Link to="/units">{t("unitsToBuy")}</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl bg-lavender-light/70 p-5 text-sm">
                <p className="font-semibold">{t("purchaseTemporarilyUnavailable")}</p>
                <p className="mt-2 text-muted-foreground">
                  {t("temporaryPurchaseMode")}
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              <p>{t("productPricesInUsd")}</p>
              <p className="mt-2">{t("paymentMethods")}</p>
            </div>
          </section>

          <aside className="glass h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
              {t("orderSummary")}
            </h2>
            <p className="mt-4 text-base font-semibold">{product.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{available} {t("inStock")}</p>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("unitPrice")}</dt>
                <dd>{formatPrice(product.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("unitsUsed")}</dt>
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
              {busy ? t("checkingAvailability") : t("tryPurchase")}
            </Button>
            <p className="mt-3 text-center text-xs text-subtle">
              {t("temporaryPurchaseMode")}
            </p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
