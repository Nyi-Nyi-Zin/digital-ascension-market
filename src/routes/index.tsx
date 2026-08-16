import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, CategoryIcon } from "@/components/site/ProductCard";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import {
  categoriesQuery,
  previewStockCount,
  productsQuery,
  stockCountsQuery,
} from "@/lib/marketplace";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud Nine — Buy Digital Subscriptions & Accounts" },
      {
        name: "description",
        content:
          "Cloud Nine is a digital products marketplace for AI subscriptions, design tools, virtual cards and streaming accounts. Pay with KBZPay, WavePay or bank transfer.",
      },
      { property: "og:title", content: "Cloud Nine — Buy Digital Subscriptions & Accounts" },
      {
        property: "og:description",
        content:
          "AI subscriptions, design tools, virtual cards and streaming — delivered instantly.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(stockCountsQuery),
    ]);
  },
  component: Index,
});

const TRUST = [
  { icon: ShieldCheck, key: "securePayment" },
  { icon: Zap, key: "instantDelivery" },
  { icon: Headphones, key: "support247" },
] as const;

const STEPS = [
  { icon: Sparkles, key: "stepPick", bodyKey: "stepPickBody" },
  { icon: Upload, key: "stepPay", bodyKey: "stepPayBody" },
  { icon: BadgeCheck, key: "stepCredentials", bodyKey: "stepCredentialsBody" },
] as const;

const STATS = [
  { value: "12,400+", label: "Orders delivered" },
  { value: "98.6%", label: "Approved in under 3h" },
  { value: "40+", label: "Digital products" },
  { value: "4.9/5", label: "Customer rating" },
];

const TESTIMONIALS = [
  {
    name: "Thiri A.",
    role: "Freelance designer",
    body: "Paid with WavePay at midnight and had my Canva Pro invite before breakfast. Smoothest local checkout I've used.",
  },
  {
    name: "Kyaw M.",
    role: "Startup founder",
    body: "We run three AI subscriptions through Cloud Nine. Verification is fast and the credentials always work.",
  },
  {
    name: "Su Su L.",
    role: "Content creator",
    body: "Love that the stock count is live — no more paying for something that's sold out.",
  },
];

function Index() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: stock } = useSuspenseQuery(stockCountsQuery);
  const { t } = useI18n();
  const [active, setActive] = useState<string>("all");

  const visible = products.filter((product) => active === "all" || product.category_id === active);
  const iconFor = (categoryId: string | null) => categories.find((c) => c.id === categoryId)?.icon;

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6">
        <div
          aria-hidden
          className="gradient-brand pointer-events-none absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Manual payment verification · Local methods supported
          </span>
          <h1 className="mt-6 text-4xl leading-tight font-extrabold sm:text-6xl">
            {t("premiumDigitalProducts")}
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">{t("heroDescription")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/products">
                {t("browseProducts")} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/faq">{t("howItWorks")}</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {TRUST.map((item) => (
              <span
                key={item.key}
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
              >
                <item.icon className="size-4 text-primary" />
                {t(item.key)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t("allProducts")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("liveStock")}</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              active === "all"
                ? "gradient-brand text-primary-foreground shadow-glow"
                : "glass text-muted-foreground hover:text-primary"
            }`}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active === cat.id
                  ? "gradient-brand text-primary-foreground shadow-glow"
                  : "glass text-muted-foreground hover:text-primary"
              }`}
            >
              <CategoryIcon name={cat.icon} className="size-4" />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              icon={iconFor(product.category_id)}
              categoryName={
                categories.find((category) => category.id === product.category_id)?.name
              }
              stock={stock[product.id] ?? previewStockCount(product.id)}
              preview={(stock[product.id] ?? 0) === 0}
            />
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="glass mt-8 rounded-3xl p-10 text-center text-sm text-muted-foreground">
            {t("noProducts")}
          </p>
        ) : null}
      </section>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <p className="text-center text-2xl font-bold sm:text-3xl">{t("howItWorks")}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.key} className="glass lift rounded-3xl p-7">
              <span className="gradient-brand flex size-12 items-center justify-center rounded-full shadow-glow">
                <step.icon className="size-5 text-primary-foreground" />
              </span>
              <p className="mt-5 text-xs font-bold tracking-widest text-subtle">STEP {i + 1}</p>
              <h3 className="mt-1 text-base font-semibold">{t(step.key)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(step.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="glass grid gap-8 rounded-3xl p-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="gradient-text text-3xl font-extrabold">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Loved by 12,000+ customers</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="glass lift rounded-3xl p-7">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-muted-foreground">"{t.body}"</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">
                {t.name}
                <span className="block text-xs font-normal text-subtle">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">{t("frequentlyAsked")}</h2>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </section>
    </SiteLayout>
  );
}
