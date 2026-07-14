"use client";

import { useState } from "react";
import FAQItem from "./FAQItem";

const faqs = [
  {
    question: "How does Wiz AI learn about my business?",
    answer:
      "Wiz AI reads your website, including your products, FAQs, and important pages, so it can answer customer questions based on your business information.",
  },
  {
    question: "Can I update what the AI knows?",
    answer:
      "Yes. Whenever you update your website or knowledge base, you can refresh Wiz AI so it uses your latest business information.",
  },
  {
    question: "What happens if Wiz AI doesn't know the answer?",
    answer:
      "If Wiz AI isn't confident about an answer, it can hand the conversation over to your support team and automatically create a support ticket.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes. Protecting your data is a priority. Your business information and customer conversations are handled securely using industry best practices.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "Most businesses can connect their website and start using Wiz AI in just a few minutes.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            FAQ
          </p>

          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600">
            Everything you need to know about setting up and using Wiz AI.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}