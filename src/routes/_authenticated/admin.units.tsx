import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatMMK } from "@/lib/wallet";

export const Route = createFileRoute("/_authenticated/admin/units")({
  component: AdminUnitsPage,
});

type TopupRow = {
  id: string;
  user_id: string;
  unit_amount: number;
  mmk_amount: number;
  payment_method: string;
  transaction_note: string;
  payment_screenshot_url: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles?: { email: string | null; full_name: string | null } | null;
};

function AdminUnitsPage() {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending",
  );
  const { data, isLoading } = useQuery({
    queryKey: ["admin-unit-topups"],
    queryFn: async (): Promise<(TopupRow & { proofUrl: string | null })[]> => {
      const { data: rows, error } = await supabase
        .from("unit_topups")
        .select(
          "id, user_id, unit_amount, mmk_amount, payment_method, transaction_note, payment_screenshot_url, status, rejection_reason, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rawRows = (rows ?? []) as unknown as TopupRow[];
      const userIds = [...new Set(rawRows.map((row) => row.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
        : { data: [] };
      const profileById = new Map(
        ((profiles ?? []) as { id: string; email: string | null; full_name: string | null }[]).map(
          (profile) => [profile.id, profile],
        ),
      );

      return await Promise.all(
        rawRows.map(async (row) => {
          if (!row.payment_screenshot_url) {
            return { ...row, profiles: profileById.get(row.user_id) ?? null, proofUrl: null };
          }

          const { data: signed } = await supabase.storage
            .from("payment-proofs")
            .createSignedUrl(row.payment_screenshot_url, 3600);
          return {
            ...row,
            profiles: profileById.get(row.user_id) ?? null,
            proofUrl: signed?.signedUrl ?? null,
          };
        }),
      );
    },
  });

  async function approve(id: string) {
    setBusyId(id);
    try {
      const { error } = await supabase.rpc("approve_unit_topup", { p_topup_id: id });
      if (error) throw error;
      toast.success("Units credited successfully");
      await queryClient.invalidateQueries({ queryKey: ["admin-unit-topups"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve the unit top-up");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      const { error } = await supabase.rpc("reject_unit_topup", {
        p_topup_id: id,
        p_reason: rejectReason[id]?.trim() || null,
      });
      if (error) throw error;
      toast.success("Unit top-up rejected");
      await queryClient.invalidateQueries({ queryKey: ["admin-unit-topups"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject the unit top-up");
    } finally {
      setBusyId(null);
    }
  }

  const filteredTopups = useMemo(
    () => (data ?? []).filter((topup) => statusFilter === "all" || topup.status === statusFilter),
    [data, statusFilter],
  );
  const counts = useMemo(
    () => ({
      all: data?.length ?? 0,
      pending: data?.filter((topup) => topup.status === "pending").length ?? 0,
      approved: data?.filter((topup) => topup.status === "approved").length ?? 0,
      rejected: data?.filter((topup) => topup.status === "rejected").length ?? 0,
    }),
    [data],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-sm font-semibold text-primary">Wallet management</p>
        <h1 className="mt-2 text-3xl font-extrabold">Unit top-ups</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verify MMK transfers before crediting USD-value units to a customer wallet.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["pending", "all", "approved", "rejected"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              statusFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/60 text-muted-foreground hover:text-primary"
            }`}
          >
            {filter} ({counts[filter]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : filteredTopups.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-10 text-center text-sm text-muted-foreground">
          No {statusFilter === "all" ? "unit top-ups" : `${statusFilter} unit top-ups`} found.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {filteredTopups.map((topup) => {
            const pending = topup.status === "pending";
            const customer = topup.profiles?.full_name || topup.profiles?.email || topup.user_id;
            return (
              <article key={topup.id} className="glass rounded-3xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      {Number(topup.unit_amount).toFixed(2)} units
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{customer}</p>
                    <p className="mt-1 text-xs text-subtle">
                      {formatMMK(topup.mmk_amount)} · {topup.payment_method} ·{" "}
                      {new Date(topup.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold capitalize">
                    {topup.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-2xl bg-background/50 p-4 text-sm">
                    <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                      Transaction note
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{topup.transaction_note}</p>
                    {topup.rejection_reason ? (
                      <p className="mt-3 text-xs text-destructive">
                        Reason: {topup.rejection_reason}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    {topup.proofUrl ? (
                      <div className="space-y-3">
                        <img
                          src={topup.proofUrl}
                          alt={`Payment proof from ${customer}`}
                          className="max-h-64 w-full rounded-2xl border border-border bg-background/60 object-contain"
                        />
                        <a
                          href={topup.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" /> Open full-size proof
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No payment proof uploaded.</p>
                    )}
                  </div>
                </div>

                {pending ? (
                  <div className="mt-5 border-t border-border pt-5">
                    <Textarea
                      value={rejectReason[topup.id] ?? ""}
                      onChange={(event) =>
                        setRejectReason((current) => ({
                          ...current,
                          [topup.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional rejection reason"
                      className="rounded-2xl"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant="hero"
                        onClick={() => approve(topup.id)}
                        disabled={busyId === topup.id}
                      >
                        {busyId === topup.id ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve and credit units
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => reject(topup.id)}
                        disabled={busyId === topup.id}
                      >
                        <X /> Reject
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
