export const SITE_URL = "https://digital-ascension-market.vercel.app";
export const SITE_NAME = "Cloud Nine";
export const SITE_DESCRIPTION =
  "Cloud Nine is a Myanmar-focused digital products marketplace for AI subscriptions, design tools, virtual cards and streaming accounts with local payment support.";
export const SOCIAL_IMAGE = `${SITE_URL}/assets/cloud-nine-logo.png`;

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: SOCIAL_IMAGE,
  email: "support@cloudnine.store",
  description: SITE_DESCRIPTION,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function productJsonLd(product: {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.id}`),
    image: product.imageUrl ? absoluteUrl(product.imageUrl) : SOCIAL_IMAGE,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price).toFixed(2),
      availability: `https://schema.org/${product.availability ?? "PreOrder"}`,
      url: absoluteUrl(`/products/${product.id}`),
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}
