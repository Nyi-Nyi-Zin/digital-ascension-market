REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.approve_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_order(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_stock_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_stock_counts() TO anon, authenticated, service_role;