import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQS, FaqAccordion } from "@/components/site/FaqAccordion";
import { useI18n } from "@/lib/i18n";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ — ${SITE_NAME} Digital Marketplace` },
      {
        name: "description",
        content:
          "Learn how payment verification, units, delivery, warranties and refunds work on Cloud Nine. KBZPay, WavePay and local payment support included.",
      },
      { property: "og:title", content: `FAQ — ${SITE_NAME} Digital Marketplace` },
      {
        property: "og:description",
        content: "Payment, verification, delivery and warranty answers for Cloud Nine buyers.",
      },
      { property: "og:url", content: absoluteUrl("/faq") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t("frequentlyAsked")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("liveStock")}</p>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </SiteLayout>
  );
}
