import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ImageUp, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { trackActivity } from "@/lib/analytics";
import { formatPrice, PAYMENT_METHODS } from "@/lib/marketplace";
import {
  formatMMK,
  mmkForUnits,
  UNIT_MMK_RATE,
  unitTopupsQuery,
  walletBalanceQuery,
} from "@/lib/wallet";

export const Route = createFileRoute("/_authenticated/units")({
  component: UnitsPage,
});

const noteSchema = z.string().trim().min(3).max(300);

function UnitsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: balance, isLoading: balanceLoading } = useQuery(walletBalanceQuery(user?.id));
  const { data: topups, isLoading: topupsLoading } = useQuery(unitTopupsQuery(user?.id));
  const [units, setUnits] = useState("");
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0].value);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedUnits = Number(units);
  const validUnits = Number.isFinite(parsedUnits) && parsedUnits > 0 && parsedUnits <= 10000;
  const mmkAmount = validUnits ? mmkForUnits(parsedUnits) : 0;
  const selected = PAYMENT_METHODS.find((item) => item.value === method) ?? PAYMENT_METHODS[0];

  async function submitTopup() {
    if (!user || !validUnits) {
      toast.error(t("enterUnitAmount"));
      return;
    }
    const parsedNote = noteSchema.safeParse(note);
    if (!parsedNote.success) {
      toast.error(t("invalidNote"));
      return;
    }
    if (!file) {
      toast.error(t("uploadScreenshot"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageFileOnly"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("screenshotMax"));
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/unit-topups/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("unit_topups").insert({
        user_id: user.id,
        unit_amount: Number(parsedUnits.toFixed(2)),
        mmk_amount: mmkAmount,
        exchange_rate: UNIT_MMK_RATE,
        payment_method: method,
        transaction_note: parsedNote.data,
        payment_screenshot_url: path,
        status: "pending",
      });
      if (error) throw error;

      setNote("");
      setFile(null);
      void trackActivity("topup_submitted", "/units", user.id, { payment_method: method });
      toast.success(t("unitTopupSubmitted"));
      await queryClient.invalidateQueries({ queryKey: ["unit-topups", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("topupSubmitError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/products"
              className="text-sm font-semibold text-muted-foreground hover:text-primary"
            >
              ← {t("products")}
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">{t("unitsToBuy")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("productPricesInUsd")}
            </p>
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
            <WalletCards className="size-5 text-primary" />
            <div>
              <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                {t("availableUnits")}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {balanceLoading ? "…" : Number(balance?.balance ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <section className="glass rounded-3xl p-7">
              <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
                {t("fixedUnitRate")}
              </h2>
              <div className="mt-4 rounded-2xl bg-lavender-light/70 p-5">
                <p className="text-2xl font-extrabold">1 USD = {formatMMK(UNIT_MMK_RATE)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("productPricesInUsd")}</p>
              </div>
              <div className="mt-6 space-y-2">
                <Label htmlFor="units">{t("unitsToBuy")}</Label>
                <Input
                  id="units"
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  value={units}
                  onChange={(event) => setUnits(event.target.value)}
                  placeholder={t("examples")}
                  inputMode="decimal"
                  className="rounded-2xl"
                />
                <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                    {t("exactAmountToTransfer")}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-primary">
                    {validUnits ? `${formatMMK(mmkAmount)} MMK` : t("enterUsdUnits")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {validUnits
                      ? `${Number(parsedUnits).toFixed(2)} USD units × ${formatMMK(UNIT_MMK_RATE)} MMK`
                      : t("examples")}
                  </p>
                </div>
              </div>
            </section>

            <section className="glass rounded-3xl p-7">
              <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
                {t("localPayment")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMethod(item.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      method === item.value
                        ? "gradient-brand text-primary-foreground shadow-glow"
                        : "border border-border bg-background/60 text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-lavender-light/70 p-5 text-sm">
                <p className="font-semibold">{selected.label}</p>
                <p className="mt-1 text-muted-foreground">{selected.holder}</p>
                <p className="mt-1 font-mono text-lg font-semibold">{selected.account}</p>
                <p className="mt-3 font-semibold text-primary">
                  {t("transferExactly")}: {validUnits ? `${formatMMK(mmkAmount)} MMK` : "—"}
                </p>
                <p className="mt-2 text-xs text-subtle">{selected.note}</p>
              </div>
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-bold">{t("submitPaymentProof")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("afterTransferInstruction")}
                </p>
              </div>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unit-note">{t("transactionIdNote")}</Label>
                  <Textarea
                    id="unit-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={300}
                    placeholder={`e.g. ${selected.label} TXN 8842910`}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-proof">{t("paymentScreenshot")}</Label>
                  <label
                    htmlFor="unit-proof"
                    className="flex cursor-pointer items-center gap-3 rounded-full border border-dashed border-primary/40 bg-background/60 px-5 py-3 text-sm text-muted-foreground hover:border-primary"
                  >
                    <ImageUp className="size-4 text-primary" />
                    {file ? file.name : t("chooseImage")}
                  </label>
                  <Input
                    id="unit-proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                onClick={submitTopup}
                disabled={busy || !validUnits}
              >
                {busy ? <Loader2 className="animate-spin" /> : null} {t("submitPaymentProof")}
              </Button>
              <p className="mt-3 text-center text-xs text-subtle">{t("pendingVerification")}</p>
            </section>
          </div>

          <aside className="glass h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold tracking-widest text-subtle uppercase">
              {t("topupHistory")}
            </h2>
            {topupsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : (topups?.length ?? 0) === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">{t("noTopups")}</p>
            ) : (
              <div className="mt-5 space-y-3">
                {topups?.map((topup) => (
                  <div
                    key={topup.id}
                    className="rounded-2xl border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {Number(topup.unit_amount).toFixed(2)} units
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatMMK(topup.mmk_amount)} · {topup.payment_method}
                        </p>
                      </div>
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold capitalize">
                        {topup.status}
                      </span>
                    </div>
                    {topup.status === "rejected" && topup.rejection_reason ? (
                      <p className="mt-3 text-xs text-destructive">{topup.rejection_reason}</p>
                    ) : null}
                    <p className="mt-3 text-xs text-subtle">
                      {new Date(topup.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
              <p>{t("exampleProduct")}</p>
              <p className="mt-2 font-semibold text-foreground">{formatPrice(12)} = 43,956 MMK</p>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
