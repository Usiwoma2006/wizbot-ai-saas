import ComparisonCard from "./ComparisonCard";

const WithoutWizAI = [
  "Slow response times",
  "Repetitive customer questions",
  "High support workload",
  "Long customer wait times",
];

const wizAI = [
  "Instant AI responses",
  "AI handles repetitive questions",
  "Lower support workload",
  "Higher customer satisfaction",
];

export default function WhyWizAI() {
  return (
    <section
      id="why-wiz-ai"
      className="bg-blue-50/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Why Wiz AI
          </p>

          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            A Better Way to Support Customers
          </h2>

          <p className="text-lg leading-8 text-gray-600">
            Replace repetitive support work with an AI assistant that responds instantly,
            learns from your business, and knows when to involve your team.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <ComparisonCard
            title="Without Wiz AI"
            items={WithoutWizAI}
            positive={false}
          />

          <ComparisonCard
            title="With Wiz AI"
            items={wizAI}
            positive
          />
        </div>

      </div>
    </section>
  );
}