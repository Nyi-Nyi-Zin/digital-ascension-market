import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock3, Filter, Loader2, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: AdminActivityPage,
});

type ActivityRow = {
  id: string;
  user_id: string | null;
  session_id: string;
  event_name: string;
  path: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type AuditRow = {
  id: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

type Profile = { id: string; email: string | null; full_name: string | null };

type EventFilter = "all" | ActivityRow["event_name"];

const FILTERS: EventFilter[] = [
  "all",
  "signed_in",
  "product_view",
  "checkout_attempt",
  "topup_submitted",
  "purchase_delivered",
  "page_view",
];

function AdminActivityPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<EventFilter>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity-stream"],
    queryFn: async () => {
      const [activityResult, auditResult] = await Promise.all([
        supabase
          .from("activity_events")
          .select("id, user_id, session_id, event_name, path, metadata, created_at")
          .order("created_at", { ascending: false })
          .limit(250),
        supabase
          .from("admin_audit_log")
          .select("id, actor_user_id, target_user_id, action, entity_type, entity_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (activityResult.error) throw activityResult.error;
      if (auditResult.error) throw auditResult.error;

      const activity = (activityResult.data ?? []) as ActivityRow[];
      const audit = (auditResult.data ?? []) as AuditRow[];
      const ids = Array.from(
        new Set(
          [
            ...activity.map((row) => row.user_id),
            ...audit.map((row) => row.actor_user_id),
            ...audit.map((row) => row.target_user_id),
          ].filter((id): id is string => Boolean(id)),
        ),
      );
      const profilesResult = ids.length
        ? await supabase.from("profiles").select("id, email, full_name").in("id", ids)
        : { data: [], error: null };
      if (profilesResult.error) throw profilesResult.error;

      return {
        activity,
        audit,
        profiles: (profilesResult.data ?? []) as Profile[],
      };
    },
  });

  const profiles = useMemo(
    () => new Map((data?.profiles ?? []).map((profile) => [profile.id, profile])),
    [data?.profiles],
  );
  const filteredActivity = useMemo(
    () => (data?.activity ?? []).filter((row) => filter === "all" || row.event_name === filter),
    [data?.activity, filter],
  );
  const summary = useMemo(() => {
    const rows = data?.activity ?? [];
    return {
      events: rows.length,
      users: new Set(rows.map((row) => row.user_id).filter(Boolean)).size,
      sessions: new Set(rows.map((row) => row.session_id)).size,
      checkouts: rows.filter((row) => row.event_name === "checkout_attempt").length,
    };
  }, [data?.activity]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{t("adminDashboard")}</p>
          <h1 className="mt-2 text-3xl font-extrabold">User activity</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review recent customer behavior and staff actions. Payment screenshots, transaction
            notes, and credentials are never shown here.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="mr-2 inline size-4 text-primary" /> Admin-only data
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Events" value={summary.events} icon={Activity} />
            <SummaryCard label="Users" value={summary.users} icon={Users} />
            <SummaryCard label="Sessions" value={summary.sessions} icon={Clock3} />
            <SummaryCard label="Checkout attempts" value={summary.checkouts} icon={Filter} />
          </div>

          <section className="glass mt-8 rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Recent user activity</h2>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((eventFilter) => (
                  <button
                    key={eventFilter}
                    type="button"
                    onClick={() => setFilter(eventFilter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filter === eventFilter
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {eventFilter === "all" ? "All" : formatEventName(eventFilter)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-xs text-subtle uppercase">
                  <tr>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Event</th>
                    <th className="px-3 py-3">Path</th>
                    <th className="px-3 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredActivity.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <UserLabel userId={row.user_id} profiles={profiles} />
                      </td>
                      <td className="px-3 py-3 font-semibold">{formatEventName(row.event_name)}</td>
                      <td className="max-w-[240px] truncate px-3 py-3 font-mono text-xs text-muted-foreground">
                        {row.path}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {formatMetadata(row.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredActivity.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No activity found for this filter.
                </p>
              ) : null}
            </div>
          </section>

          <section className="glass mt-6 rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold">Admin audit trail</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Status changes to orders and unit top-ups are recorded by database triggers.
                </p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-xs text-subtle uppercase">
                  <tr>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Actor</th>
                    <th className="px-3 py-3">Target</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.audit ?? []).map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <UserLabel userId={row.actor_user_id} profiles={profiles} />
                      </td>
                      <td className="px-3 py-3">
                        <UserLabel userId={row.target_user_id} profiles={profiles} />
                      </td>
                      <td className="px-3 py-3 font-semibold">{row.action}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {row.entity_type} · {row.entity_id ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.audit?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No admin actions recorded yet.
                </p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
}) {
  return (
    <div className="glass lift rounded-3xl p-6">
      <span className="gradient-brand flex size-11 items-center justify-center rounded-full shadow-glow">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      <p className="mt-4 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function UserLabel({
  userId,
  profiles,
}: {
  userId: string | null;
  profiles: Map<string, Profile>;
}) {
  if (!userId) return <span className="text-xs text-subtle">Anonymous session</span>;
  const profile = profiles.get(userId);
  return <span>{profile?.full_name || profile?.email || userId.slice(0, 8)}</span>;
}

function formatEventName(eventName: string) {
  return eventName.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata ?? {}).filter(([key]) => key !== "product_id");
  if (!entries.length) return "—";
  return entries.map(([key, value]) => `${key}: ${String(value).slice(0, 80)}`).join(" · ");
}
