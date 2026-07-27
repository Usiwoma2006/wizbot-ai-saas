"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/Knowledge-base/StatsCard";
import KnowledgeSourceCard from "@/components/Knowledge-base/KnowledgeSourceCard";
import AIPreviewModal from "@/components/Knowledge-base/AIPreviewModal";
import PreviewDrawer from "@/components/Knowledge-base/PreviewDrawer";
import SearchBar from "@/components/Knowledge-base/SearchBar";
import ArticleCard from "@/components/Knowledge-base/ArticleCard";
import api from "@/lib/api";

export default function KnowledgeBasePage() {
  const [website, setWebsite] = useState(null);
  const [customArticles, setCustomArticles] = useState([]);
  const [websitePages, setWebsitePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Get websites
      const websiteRes = await api.get("/websites/");
      console.log("Website response:", websiteRes.data);

      const primaryWebsite = Array.isArray(websiteRes.data)
        ? websiteRes.data[0]
        : websiteRes.data.results?.[0];

      console.log("Primary website:", primaryWebsite);
      setWebsite(primaryWebsite ?? null);

      let pagesData = [];
      let articlesData = [];

      if (primaryWebsite) {
        try {
          // FIXED: Added extra 'websites/' in the URL path
          console.log(`Fetching pages for website: ${primaryWebsite.id}`);
          const pagesRes = await api.get(`/websites/websites/${primaryWebsite.id}/pages/`);
          console.log("Pages response:", pagesRes.data);
          
          // Handle different response formats
          if (Array.isArray(pagesRes.data)) {
            pagesData = pagesRes.data;
          } else if (pagesRes.data.results) {
            pagesData = pagesRes.data.results;
          } else if (pagesRes.data.data) {
            pagesData = pagesRes.data.data;
          } else if (typeof pagesRes.data === 'object' && pagesRes.data !== null) {
            pagesData = [pagesRes.data];
          } else {
            pagesData = [];
          }
          
          console.log(`Loaded ${pagesData.length} pages for website ${primaryWebsite.id}`);
        } catch (pagesErr) {
          console.error("Error fetching pages:", pagesErr);
          console.error("Error details:", pagesErr.response?.data);
          pagesData = [];
        }

        try {
          // Fetch custom articles
          const articlesRes = await api.get("/websites/custom-articles/");
          console.log("Custom articles response:", articlesRes.data);
          
          if (Array.isArray(articlesRes.data)) {
            articlesData = articlesRes.data;
          } else if (articlesRes.data.results) {
            articlesData = articlesRes.data.results;
          } else if (articlesRes.data.data) {
            articlesData = articlesRes.data.data;
          } else {
            articlesData = [];
          }
          
          console.log(`Loaded ${articlesData.length} custom articles`);
        } catch (articlesErr) {
          console.error("Error fetching custom articles:", articlesErr);
          articlesData = [];
        }
      }

      setWebsitePages(pagesData);
      setCustomArticles(articlesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSync() {
    if (!website) return;
    setSyncing(true);
    try {
      console.log(`Syncing website: ${website.id}`);
      const syncRes = await api.post(`/websites/${website.id}/sync/`);
      console.log("Sync response:", syncRes.data);
      
      // Wait a moment for the sync to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload data after sync
      await loadData();
    } catch (err) {
      console.error("Sync error:", err);
      console.error("Sync error details:", err.response?.data);
      setError(err);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteArticle(id) {
    try {
      await api.delete(`/websites/custom-articles/${id}/`);
      setCustomArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err);
    }
  }

  function handlePreview(article) {
    setPreviewArticle(article);
  }

  function handleClosePreview() {
    setPreviewArticle(null);
  }

  // Combine articles from both sources
  const articles = [
    ...websitePages.map((page) => ({
      id: page.id || page.url || `page-${index}`,
      title: page.title || page.url || "Untitled Page",
      source: "Website",
      note: page.url || "",
      content: page.clean_text || page.content || "No content available.",
      status: page.status || "Synced",
      url: page.url || "",
      lastUpdated: page.last_crawled || "—",
      chunks: page.chunks_count || page.chunks?.length || "—",
      similarity: "—", // not applicable outside search context
      type: "website",
      raw: page,
    })),

  ...(customArticles || []).map((article) => ({
    id: article.id || `article-${index}`,
    title: article.title || "Untitled Article",
    source: "Custom Article",
    note: article.content?.slice(0, 100) || "",
    content: article.content || "No content available.",
    status: article.status || "—",
    url: "", // custom articles have no source URL
    lastUpdated: article.updated_at || "—",
    chunks: article.chunks_count ?? 0,
    similarity: "—",
    type: "custom",
    raw: article,
  })),
];

  console.log("Total articles:", articles.length);
  console.log("Website pages:", websitePages.length);
  console.log("Custom articles:", customArticles?.length || 0);

  const suggestedQuestions = articles.map((a) => a.title).slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          <p className="font-medium mb-2">Couldn&apos;t load your knowledge base.</p>
          <p className="text-red-600">{error.message || "Please check your connection and try again."}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Knowledge Base</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Articles"
          value={String((website?.pages_count ?? 0) + (customArticles?.length ?? 0))}
          subtitle="Website pages + custom"
        />
        <StatsCard
          title="Website Pages"
          value={String(website?.pages_count ?? 0)}
          subtitle="Auto Synced"
        />
        <StatsCard
          title="Custom Articles"
          value={String(customArticles?.length ?? 0)}
          subtitle="Manually created"
        />
        <StatsCard
          title="Last Sync"
          value={website?.last_scraped ? "Synced" : "Never"}
          subtitle={website?.status === "ready" ? "Website • Complete" : website?.status ?? "—"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <KnowledgeSourceCard
            title={website?.platform ?? "Website"}
            badge={website?.status === "ready" ? "Connected" : website?.status ?? "Not connected"}
            badgeColor={website?.status === "ready" ? "green" : "gray"}
            number={String(website?.pages_count ?? 0)}
            label="Pages Indexed"
            time={website?.last_scraped ? `Synced ${new Date(website.last_scraped).toLocaleDateString()}` : "Never synced"}
            button={syncing ? "Syncing…" : "Sync Website"}
            onButtonClick={handleSync}
            buttonDisabled={syncing || !website}
          />
          <KnowledgeSourceCard
            title="Custom Articles"
            badge="Editable"
            badgeColor="blue"
            number={String(customArticles?.length ?? 0)}
            label="Articles"
            time="Live"
            button="New Article"
            onButtonClick={() => console.log("open new article form")}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <SearchBar />
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
                No knowledge found. 
                {!website && " Connect a website or add custom articles to get started."}
                {website && " Sync your website to fetch pages or add custom articles."}
              </div>
            ) : (
              articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  source={article.source}
                  note={article.note}
                  chunks={String(article.chunks)}
                  onPreview={() => handlePreview(article)}
                  onEdit={() => console.log("edit", article.id)}
                  onDelete={
                    article.type === "custom"
                      ? () => handleDeleteArticle(article.id)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </div>

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
      </div>
  );
}