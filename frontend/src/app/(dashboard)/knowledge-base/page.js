"use client";

import { useState } from "react";
import StatsCard from "@/components/Knowledge-base/StatsCard";
import KnowledgeSourceCard from "@/components/Knowledge-base/KnowledgeSourceCard";
import AIPreviewModal from "@/components/Knowledge-base/AIPreviewModal";
import PreviewDrawer from "@/components/Knowledge-base/PreviewDrawer";
import SearchBar from "@/components/Knowledge-base/SearchBar";
import ArticleCard from "@/components/Knowledge-base/ArticleCard";

const articles = [
  {
    id: 1,
    title: "Shipping Policy",
    source: "Website",
    status: "Synced",
    url: "wizbot-demo.com/shipping",
    lastUpdated: "2 hours ago",
    note: "Customers receive orders in 3–5 business days...",
    content:
      "We ship to over 40 countries worldwide. Standard delivery takes 5–10 business days depending on destination.",
    chunks: "4",
    similarity: "0.86",
  },
  {
    id: 2,
    title: "Returns",
    source: "Custom Article",
    status: "Synced",
    url: "custom/returns",
    lastUpdated: "Today",
    note: "Refunds take 5–7 business days.",
    content:
      "Free returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached.",
    chunks: "2",
    similarity: "0.79",
  },
  {
    id: 3,
    title: "Payment Methods",
    source: "Website",
    status: "Synced",
    url: "wizbot-demo.com/payments",
    lastUpdated: "Yesterday",
    note: "We accept credit cards, PayPal, and Bitcoin.",
    content:
      "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Klarna for installment plans.",
    chunks: "3",
    similarity: "0.79",
  },
  {
    id: 4,
    title: "Tracking Orders",
    source: "Custom Article",
    status: "Synced",
    url: "custom/tracking",
    lastUpdated: "3 days ago",
    note: "Track your order with the provided tracking number.",
    content:
      "Once your order ships, you'll receive a tracking number by email. Track it directly on the carrier's website.",
    chunks: "2",
    similarity: "0.81",
  },
];

const suggestedQuestions = [
  "Do you ship internationally?",
  "Can I pay with Bitcoin?",
  "What is your return policy?",
];

export default function KnowledgeBasePage() {
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);

  function handlePreview(article) {
    setPreviewArticle(article);
  }

  function handleClosePreview() {
    setPreviewArticle(null);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Knowledge Base</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Articles" value="128" subtitle="+12 this week" />
        <StatsCard title="Website Pages" value="64" subtitle="Auto Synced" />
        <StatsCard title="Custom Articles" value="18" subtitle="Manually created" />
        <StatsCard title="Last Sync" value="2h ago" subtitle="Website • Complete" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <KnowledgeSourceCard
            title="Shopify"
            badge="Connected"
            badgeColor="green"
            number="64"
            label="Products Indexed"
            time="2 hours ago"
            button="Sync Website"
          />
          <KnowledgeSourceCard
            title="Custom Articles"
            badge="Editable"
            badgeColor="blue"
            number="18"
            label="Articles"
            time="Today"
            button="New Article"
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <SearchBar />
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                source={article.source}
                note={article.note}
                chunks={article.chunks}
                onPreview={() => handlePreview(article)}
                onEdit={() => console.log("edit", article.id)}
                onDelete={() => console.log("delete", article.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Preview trigger */}
      <button
        onClick={() => setAiPreviewOpen(true)}
        className="fixed bottom-8 right-8 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition z-40"
      >
        Preview AI
      </button>

      <AIPreviewModal
        isOpen={aiPreviewOpen}
        onClose={() => setAiPreviewOpen(false)}
        suggestedQuestions={suggestedQuestions}
      />

      <PreviewDrawer
        isOpen={!!previewArticle}
        onClose={handleClosePreview}
        article={previewArticle}
      />
    </div>
  );
}