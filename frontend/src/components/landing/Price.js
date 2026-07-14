import PriceCard from "./PriceCard";

const plans = [
  {
    plan: "Starter",
    price: "$29/mo",
    description: "Perfect for small businesses.",
    items: ["1 website", "Up to 500 conversations/mo", "Email support", "Basic analytics"],
    popular: false,
  },
  {
    plan: "Growth",
    price: "$99/mo",
    description: "For growing support teams.",
    items: ["3 websites", "Up to 5,000 conversations/mo", "Priority support", "Advanced analytics", "AI suggestions"],
    popular: true,
  },
  {
    plan: "Enterprise",
    price: "Custom",
    description: "For large-scale operations.",
    items: ["Unlimited websites", "Unlimited conversations", "Dedicated CSM", "SSO & audit logs", "Custom SLAs"],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Pricing
          </p>
          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg leading-8 text-gray-600">
            Start free. Scale when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((p) => (
            <PriceCard key={p.plan} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}