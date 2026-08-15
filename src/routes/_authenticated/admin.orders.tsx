import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/site/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, PAYMENT_METHODS } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

type AdminOrder = {
  id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_method: string;
  transaction_note: string | null;
  payment_screenshot_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  products: { name: string } | null;
  profiles: { email: string | null; full_name: string | null } | null;
};

const TABS = ["all", "pending", "delivered", "rejected"] as const;

function AdminOrders() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [review, setReview] = useState<AdminOrder | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, user_id, quantity, total_price, status, payment_method, transaction_note, payment_screenshot_url, rejection_reason, created_at, products(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      const orders = (data ?? []) as unknown as AdminOrder[];
      const ids = [...new Set(orders.map((o) => o.user_id))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", ids);
        const map = new Map((profiles ?? []).map((p) => [p.id, p]));
        for (const order of orders) {
          order.profiles = map.get(order.user_id) ?? null;
        }
      }
      return orders;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["stock-counts"] });
  };

  const approve = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc("approve_order", { p_order_id: orderId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order approved — credentials delivered");
      setReview(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reject = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order rejected — the customer can see the reason");
      setReview(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const visible = (data ?? []).filter((o) => (tab === "all" ? true : o.status === tab));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review payment proofs, then approve to auto-deliver credentials.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "gradient-brand text-primary-foreground shadow-glow"
                : "glass text-muted-foreground hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass mt-6 overflow-x-auto rounded-3xl p-2">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-widest text-subtle uppercase">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <span className="block font-semibold">
                      {order.profiles?.full_name || "Customer"}
                    </span>
                    <span className="text-xs text-subtle">{order.profiles?.email ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {order.products?.name ?? "—"}
                    <span className="text-xs text-subtle"> × {order.quantity}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total_price)}</td>
                  <td className="px-4 py-3">
                    {PAYMENT_METHODS.find((m) => m.value === order.payment_method)?.label ??
                      order.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="soft" size="sm" onClick={() => setReview(order)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No {tab === "all" ? "" : tab} orders.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <ReviewDialog
        order={review}
        onClose={() => setReview(null)}
        onApprove={(id) => approve.mutate(id)}
        onReject={(id, reason) => reject.mutate({ orderId: id, reason })}
        busy={approve.isPending || reject.isPending}
      />
    </div>
  );
}

function ReviewDialog({
  order,
  onClose,
  onApprove,
  onReject,
  busy,
}: {
  order: AdminOrder | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    setReason("");
    setProofUrl(null);
    if (!order?.payment_screenshot_url) return;
    let active = true;
    void supabase.storage
      .from("payment-proofs")
      .createSignedUrl(order.payment_screenshot_url, 600)
      .then(({ data }) => {
        if (active) setProofUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [order]);

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review payment</DialogTitle>
          <DialogDescription>
            {order?.products?.name} · {order ? formatPrice(order.total_price) : ""} ·{" "}
            {order?.profiles?.email ?? "customer"}
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-lavender-light/60 p-4 text-sm">
              <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                Transaction note
              </p>
              <p className="mt-2">{order.transaction_note || "—"}</p>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                Payment screenshot
              </p>
              {proofUrl ? (
                <a href={proofUrl} target="_blank" rel="noreferrer">
                  <img
                    src={proofUrl}
                    alt="Payment screenshot"
                    className="mt-2 max-h-72 w-full rounded-2xl object-contain"
                  />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {order.payment_screenshot_url ? "Loading screenshot…" : "No screenshot uploaded."}
                </p>
              )}
            </div>

            {order.status === "pending" ? (
              <>
                <div>
                  <p className="text-xs font-bold tracking-widest text-subtle uppercase">
                    Rejection reason (required to reject)
                  </p>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={300}
                    placeholder="e.g. Amount received does not match the order total"
                    className="mt-2 rounded-2xl"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="success"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => onApprove(order.id)}
                  >
                    {busy ? <Loader2 className="animate-spin" /> : <Check />} Approve & deliver
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => {
                      if (reason.trim().length < 3) {
                        toast.error("Please write a rejection reason");
                        return;
                      }
                      onReject(order.id, reason.trim());
                    }}
                  >
                    <X /> Reject
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                {order.rejection_reason ? (
                  <span className="text-sm text-muted-foreground">{order.rejection_reason}</span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
