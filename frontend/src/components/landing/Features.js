import {
  Bot,
  Globe,
  Search,
  BookOpen,
  UserRoundCheck,
  Ticket,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: Bot,
    title: "AI Customer Support",
    description:
      "Deliver instant, accurate responses using AI trained on your store's knowledge.",
  },
  {
    icon: Globe,
    title: "Website Crawling",
    description:
      "Automatically crawl your website and keep your AI knowledge base updated.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Retrieve the most relevant answers using AI-powered vector search.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Turn product pages, FAQs, and policies into searchable AI knowledge.",
  },
  {
    icon: UserRoundCheck,
    title: "Human Escalation",
    description:
      "Transfer conversations to your support team whenever AI confidence is low.",
  },
  {
    icon: Ticket,
    title: "Automatic Tickets",
    description:
      "Create support tickets automatically for conversations needing human follow-up.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-blue-50/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="mb-3 font-semibold uppercase tracking-widest text-blue-600">
            Features
          </p>

          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Everything You Need to Automate Customer Support
          </h2>

          <p className="text-lg leading-8 text-gray-600">
            Connect your website, build an AI-powered knowledge base,
            answer customer questions instantly, and seamlessly
            hand complex conversations to your support team.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>

      </div>
    </section>
  );
}