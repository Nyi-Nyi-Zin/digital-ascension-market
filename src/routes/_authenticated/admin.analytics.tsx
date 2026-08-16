import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ExternalLink, Globe2, Loader2, Monitor, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalyticsPage,
});

type RangeDays = 7 | 30;
type PageView = {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  device_type: string;
  created_at: string;
};

type AnalyticsResult = {
  rows: PageView[];
  error: string | null;
};

const SEO_URLS = [
  { label: "Sitemap.xml", href: "/sitemap.xml" },
  { label: "Robots.txt", href: "/robots.txt" },
];

function AdminAnalyticsPage() {
  const { t } = useI18n();
  const [range, setRange] = useState<RangeDays>(7);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics-page-views"],
    queryFn: async (): Promise<AnalyticsResult> => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const { data: rows, error } = await supabase
        .from("page_views")
        .select("id, session_id, path, referrer, device_type, created_at")
        .gte("created_at", cutoff.toISOString())
        .order("created_at", { ascending: true });
      if (error) return { rows: [], error: error.message };
      return { rows: (rows ?? []) as PageView[], error: null };
    },
  });

  const filteredRows = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return (data?.rows ?? []).filter((row) => new Date(row.created_at) >= cutoff);
  }, [data?.rows, range]);

  const summary = useMemo(() => {
    const topPages = countBy(filteredRows, (row) => row.path).slice(0, 6);
    const referrers = countBy(filteredRows, (row) => row.referrer || "Direct / none").slice(0, 5);
    const devices = countBy(filteredRows, (row) => row.device_type);
    const daily = Array.from({ length: range }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (range - index - 1));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: filteredRows.filter((row) => row.created_at.slice(0, 10) === key).length,
      };
    });
    return {
      pageviews: filteredRows.length,
      visitors: new Set(filteredRows.map((row) => row.session_id)).size,
      topPages,
      referrers,
      devices,
      daily,
    };
  }, [filteredRows, range]);

  const maxDaily = Math.max(1, ...summary.daily.map((item) => item.count));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{t("growthDiscoverability")}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{t("seoAnalytics")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("analyticsDescription")}
          </p>
        </div>
        <div className="flex rounded-full border border-border bg-background/60 p-1">
          {([7, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                range === days ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {days} {t("days")}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {data?.error ? (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-700 dark:text-amber-300">
              {t("analyticsTableMissing")} {t("applyAnalyticsMigration")}
              <code className="mx-1 rounded bg-background/60 px-1.5 py-0.5">20260817000000_analytics.sql</code>
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={t("pageviews")} value={summary.pageviews} icon={BarChart3} />
            <MetricCard label={t("uniqueVisitors")} value={summary.visitors} icon={Users} />
            <MetricCard label={t("publicPagesTracked")} value={24} icon={Globe2} />
            <MetricCard label={t("searchConsole")} value={t("notConnected")} icon={Search} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{t("visitorTrend")}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{t("pageviewsPerDay")}</p>
                </div>
                <BarChart3 className="size-5 text-primary" />
              </div>
              <div className="mt-7 flex h-44 items-end gap-1.5 sm:gap-2">
                {summary.daily.map((item) => (
                  <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-primary/75 transition-all"
                      style={{ height: `${Math.max(6, (item.count / maxDaily) * 128)}px` }}
                      title={`${item.label}: ${item.count} pageviews`}
                    />
                    <span className="truncate text-[9px] text-subtle">
                      {range === 7 ? item.label.split(" ")[1] : item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-3xl p-6">
                                <h2 className="text-base font-semibold">{t("deviceMix")}</h2>

              <div className="mt-5 space-y-4">
                {summary.devices.length ? (
                  summary.devices.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 capitalize">
                          <Monitor className="size-4 text-primary" /> {item.label}
                        </span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(item.count / Math.max(1, summary.pageviews)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("noPageviews")}</p>
                )}
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CountList title={t("topPublicPages")} items={summary.topPages} />
            <CountList title={t("trafficReferrers")} items={summary.referrers} />
          </div>

          <section className="glass mt-6 rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{t("seoHealth")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("publicCrawlAssets")}
                </p>
              </div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                {t("sitemapReady")}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {SEO_URLS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-accent"
                >
                  {item.label} <ExternalLink className="size-4" />
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function countBy(rows: PageView[], getLabel: (row: PageView) => string) {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(getLabel(row), (counts.get(getLabel(row)) ?? 0) + 1));
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count,
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof BarChart3;
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

function CountList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="shrink-0 font-semibold">{item.count}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No data collected yet.</li>
        )}
      </ul>
    </section>
  );
}
