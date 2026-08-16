import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ImageUp, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  PAYMENT_METHODS,
  formatPrice,
  productQuery,
  stockCountsQuery,
} from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/checkout/$productId")({
  component: CheckoutPage,
});

const noteSchema = z.string().trim().min(3, "Add your transaction ID or a short note").max(300);

function CheckoutPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: product, isLoading } = useQuery(productQuery(productId));
  const { data: stock } = useQuery(stockCountsQuery);

  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0].value);
  const quantity = 1;
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const available = stock?.[productId] ?? 0;
  const selected = PAYMENT_METHODS.find((m) => m.value === method) ?? PAYMENT_METHODS[0];
  const total = (product?.price ?? 0) * quantity;

  async function confirmOrder() {
    if (!product || !user) return;

    const parsedNote = noteSchema.safeParse(note);
    if (!parsedNote.success) {
      toast.error(parsedNote.error.issues[0]?.message ?? "Invalid note");
      return;
    }
    if (!file) {
      toast.error("Please upload your payment screenshot");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Screenshot must be smaller than 5MB");
      return;
    }

    setBusy(true);
    try {
      // Validate live stock before creating the order.
      const { data: counts, error: countError } = await supabase.rpc("get_stock_counts");
      if (countError) throw countError;
      const live =
        ((counts ?? []) as { product_id: string; available_count: number }[]).find(
          (row) => row.product_id === product.id,
        )?.available_count ?? 0;
      if (Number(live) < quantity) {
        toast.error("Not enough stock left for this product. Please try a smaller quantity.");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          total_price: product.price * quantity,
          payment_method: method,
          transaction_note: parsedNote.data,
          payment_screenshot_url: path,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Order submitted for verification");
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
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

        <h1 className="mt-6 text-3xl font-extrabold">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Transfer the total, then upload your screenshot so our team can verify the payment.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            {/* Payment method */}
            <section className="glass rounded-3xl p-7">
              <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
                Payment method
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      method === m.value
                        ? "gradient-brand text-primary-foreground shadow-glow"
                        : "border border-border bg-background/60 text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-lavender-light/70 p-6 sm:flex-row sm:items-center">
                <div className="flex size-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-background/70">
                  <QrCode className="size-12 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{selected.label}</p>
                  <p className="mt-1 text-muted-foreground">{selected.holder}</p>
                  <p className="mt-1 font-mono text-base font-semibold">{selected.account}</p>
                  <p className="mt-2 text-xs text-subtle">{selected.note}</p>
                </div>
              </div>
            </section>

            {/* Proof */}
            <section className="glass rounded-3xl p-7">
              <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
                Payment proof
              </h2>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Transaction ID / note</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={300}
                    placeholder="e.g. KBZPay TRX 8842910 — sent from 09770001234"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proof">Payment screenshot</Label>
                  <label
                    htmlFor="proof"
                    className="flex cursor-pointer items-center gap-3 rounded-full border border-dashed border-primary/40 bg-background/60 px-5 py-3 text-sm text-muted-foreground hover:border-primary"
                  >
                    <ImageUp className="size-4 text-primary" />
                    {file ? file.name : "Choose an image (max 5MB)"}
                  </label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="glass h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
              Order summary
            </h2>
            <p className="mt-4 text-base font-semibold">{product.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{available} available in stock</p>

            <div className="mt-5 flex items-center justify-between">
              <Label>Quantity</Label>
              <span className="text-sm font-semibold">1 digital product</span>
            </div>

            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Unit price</dt>
                <dd>{formatPrice(product.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Method</dt>
                <dd>{selected.label}</dd>
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
              disabled={busy || available === 0}
            >
              {busy ? <Loader2 className="animate-spin" /> : null} Confirm Order
            </Button>
            <p className="mt-3 text-center text-xs text-subtle">
              Your order stays pending until an admin verifies the payment.
            </p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
