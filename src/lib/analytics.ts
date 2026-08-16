import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "cloud-nine-analytics-session";
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
}
