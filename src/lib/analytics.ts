import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "cloud-nine-analytics-session";

export type ActivityEventName =
  | "page_view"
  | "signed_in"
  | "signed_out"
  | "product_view"
  | "checkout_attempt"
  | "topup_submitted"
  | "purchase_delivered";

type ActivityMetadata = Record<string, string | number | boolean>;
const PRIVATE_PREFIXES = [
  "/admin",
  "/auth",
  "/checkout",
  "/units",
  "/orders",
  "/purchases",
  "/_authenticated",
];

function isPublicPath(path: string) {
  return path === "/" || !PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getSessionId() {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

function getDeviceType() {
  if (typeof window === "undefined") return "unknown" as const;
  const width = window.innerWidth;
  if (width < 640) return "mobile" as const;
  if (width < 1024) return "tablet" as const;
  return "desktop" as const;
}

function getSafeReferrer() {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin;
  } catch {
    return null;
  }
}

export async function trackActivity(
  eventName: ActivityEventName,
  path: string,
  userId?: string | null,
  metadata: ActivityMetadata = {},
) {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const safeMetadata = Object.fromEntries(
    Object.entries(metadata)
      .filter(
        ([key, value]) =>
          /^[a-z0-9_]{1,40}$/.test(key) &&
          (typeof value === "string" || typeof value === "number" || typeof value === "boolean"),
      )
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 180) : value]),
  );

  await supabase.from("activity_events").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    event_name: eventName,
    path: path.slice(0, 200),
    metadata: safeMetadata,
  });
}

export async function trackPageView(path: string) {
  if (typeof window === "undefined" || !isPublicPath(path)) return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  await supabase.from("page_views").insert({
    session_id: sessionId,
    path: path.slice(0, 500),
    referrer: getSafeReferrer(),
    device_type: getDeviceType(),
  });
  void trackActivity("page_view", path);
}
