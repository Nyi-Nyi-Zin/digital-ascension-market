import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQS, FaqAccordion } from "@/components/site/FaqAccordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Cloud Nine Digital Marketplace" },
      {
        name: "description",
        content:
          "How payment verification, delivery, warranties and refunds work on Cloud Nine. KBZPay, WavePay and bank transfer supported.",
      },
      { property: "og:title", content: "FAQ — Cloud Nine Digital Marketplace" },
      {
        property: "og:description",
        content: "Payment, verification, delivery and warranty answers for Cloud Nine buyers.",
      },
    ],
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
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Questions, <span className="gradient-text">answered</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything about paying locally and receiving your digital products.
        </p>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </SiteLayout>
  );
}
