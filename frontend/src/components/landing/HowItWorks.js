import {
  Link2,
  Globe,
  Brain,
  Bot,
} from "lucide-react";

import StepCard from "./StepCard";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Website",
    description:
      "Add your website in seconds and let Wiz AI securely connect to your business.",
  },
  {
    number: "02",
    icon: Globe,
    title: "Crawl Your Content",
    description:
      "Wiz AI automatically crawls your website to collect products, FAQs, and documentation.",
  },
  {
    number: "03",
    icon: Brain,
    title: "Build AI Knowledge",
    description:
      "Your content is processed into embeddings and indexed for fast semantic search.",
  },
  {
    number: "04",
    icon: Bot,
    title: "Support Customers",
    description:
      "Answer customer questions instantly while automatically escalating complex conversations.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="mb-3 font-semibold uppercase tracking-widest text-blue-600">
            How It Works
          </p>

          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Go Live in Minutes
          </h2>

          <p className="text-lg leading-8 text-gray-600">
            Setting up Wiz AI is simple. Connect your website,
            let AI learn your business, and start supporting
            customers with intelligent responses.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
          <StepCard
              key={step.number}
              {...step}
              isLast={index === steps.length - 1}
        />
        ))}
        </div>

      </div>
    </section>
  );
}