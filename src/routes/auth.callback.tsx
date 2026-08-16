import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const searchSchema = {
  parse: (value: Record<string, unknown>) => ({
    code: typeof value.code === "string" ? value.code : undefined,
    redirect: typeof value.redirect === "string" ? value.redirect : undefined,
    error: typeof value.error === "string" ? value.error : undefined,
    error_description:
      typeof value.error_description === "string" ? value.error_description : undefined,
  }),
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(
    search.error_description ?? search.error ?? null,
  );

  const destination = search.redirect?.startsWith("/") ? search.redirect : "/products";

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      if (search.error || search.error_description) {
        return;
      }

      if (search.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(search.code);
        if (exchangeError) {
          if (active) setError(exchangeError.message);
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !data.session) {
        setError(sessionError?.message ?? t("somethingWentWrong"));
        return;
      }

      navigate({ to: destination, replace: true });
    }

    void completeOAuth();
    return () => {
      active = false;
    };
  }, [destination, navigate, search.code, search.error, search.error_description]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-14">
      <Wordmark />
      <div className="glass mt-8 w-full max-w-md rounded-3xl p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold">{t("somethingWentWrong")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-6 rounded-full" onClick={() => navigate({ to: "/auth" })}>
              {t("signIn")}
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
            <h1 className="mt-4 text-2xl font-bold">{t("signIn")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("securePayment")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
