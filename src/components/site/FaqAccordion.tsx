import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQS = [
  {
    q: "How do I pay?",
    a: "Choose KBZPay, WavePay or bank transfer at checkout. You'll see the account details and a QR code, then upload your payment screenshot so our team can verify it.",
  },
  {
    q: "How long does verification take?",
    a: "Payments are reviewed manually, usually within 1–3 hours during working hours and always within 24 hours.",
  },
  {
    q: "How is my product delivered?",
    a: "Once your payment is approved, your credentials are assigned automatically and appear in My Purchases — you can copy them straight from your dashboard.",
  },
  {
    q: "What if my payment is rejected?",
    a: "You'll see the exact reason on your order card in My Purchases, and you can re-submit a corrected payment right away.",
  },
  {
    q: "Are the accounts guaranteed?",
    a: "Every product lists a warranty in its \"What you get\" section. If a credential stops working inside the warranty window, we replace it.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQS.map((item, i) => (
        <AccordionItem
          key={item.q}
          value={`item-${i}`}
          className="glass mb-3 rounded-3xl border-none px-6"
        >
          <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
