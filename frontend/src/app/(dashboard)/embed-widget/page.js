"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Monitor, Send } from "lucide-react";
import api from "@/lib/api";

const INSTALL_STEPS = [
  {
    platform: "Shopify",
    steps: [
      "In Shopify, open Online Store → Themes → Edit code.",
      "Locate the theme.liquid file in the Layout folder.",
      "Paste the snippet just before the closing </body> tag and Save.",
      "Refresh your storefront — the Wiz bubble appears bottom-right.",
    ],
  },
  {
    platform: "WordPress",
    steps: [
      "In WordPress, go to Appearance → Theme File Editor.",
      "Open footer.php.",
      "Paste the snippet just before the closing </body> tag and Update File.",
      "Refresh your site — the Wiz bubble appears bottom-right.",
    ],
  },
  {
    platform: "Custom / Other",
    steps: [
      "Open the HTML file that defines your site's global layout.",
      "Find the closing </body> tag.",
      "Paste the snippet immediately before it.",
      "Deploy your changes — the Wiz bubble appears bottom-right.",
    ],
  },
];

// Points at your real widget.js and real API base — no more placeholder CDN.
function getSnippet(embedKey) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const widgetSrc = process.env.NEXT_PUBLIC_WIDGET_URL || "http://127.0.0.1:8000/static/widget/widget.js";
  return `<script\n  src="${widgetSrc}"\n  data-embed-key="${embedKey}"\n  data-api-base="${apiBase}"\n  defer\n></script>`;
}

export default function EmbedWidgetPage() {
  const [merchant, setMerchant] = useState(null);
  const [platform, setPlatform] = useState("Shopify");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api.get("/merchant/me/");
        if (!cancelled) setMerchant(data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  }

  if (error || !merchant) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load your widget settings. Please try again.
        </div>
      </div>
    );
  }

  const snippet = getSnippet(merchant.embed_key);
  const activeSteps = INSTALL_STEPS.find((p) => p.platform === platform).steps;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // ... rest of the JSX stays exactly the same, just using the real `merchant`
  //     from state instead of the hardcoded const.

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Embed Widget</h1>
          <p className="text-sm text-gray-500 mt-1">
            Drop Wiz onto your storefront in under a minute.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT: Install instructions */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Install on your site</h2>
              <p className="text-sm text-gray-400 mt-1">
                Copy this snippet and paste before{" "}
                <code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                  &lt;/body&gt;
                </code>
                .
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          <pre className="mt-4 bg-gray-900 text-gray-100 text-xs sm:text-sm rounded-lg p-3 sm:p-4 overflow-x-auto">
            <code className="break-all sm:break-normal">{snippet}</code>
          </pre>

          {/* Platform tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {INSTALL_STEPS.map((p) => (
              <button
                key={p.platform}
                onClick={() => setPlatform(p.platform)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex-1 sm:flex-none ${
                  platform === p.platform
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.platform}
              </button>
            ))}
          </div>

          <ol className="mt-4 space-y-3">
            {activeSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 border border-dashed border-gray-200 rounded-lg py-8 sm:py-10 flex flex-col items-center justify-center text-gray-400">
            <Monitor size={28} className="text-gray-300" />
            <span className="text-sm mt-2">Screen recording coming soon</span>
          </div>
        </div>

        {/* RIGHT: Live preview */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900">Widget Preview</h2>
          <p className="text-sm text-gray-400 mt-1">
            How Wiz will look on your storefront.
          </p>

          <div className="mt-4 relative bg-gray-50 border border-gray-100 rounded-lg h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden">
            {/* Fake page skeleton behind the widget */}
            <div className="p-5 space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Widget itself - made responsive */}
            <div className="absolute bottom-4 right-2 sm:right-4 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3"
                style={{ backgroundColor: merchant.widget_color }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                    {merchant.widget_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={merchant.widget_avatar_url}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      merchant.widget_name?.[0] ?? "W"
                    )}
                  </div>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {merchant.widget_name}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>

              <div className="p-2.5 sm:p-3 space-y-2 bg-white">
                <div className="bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-[85%]">
                  Hi Wiz! Do you ship to Canada?
                </div>
                <div
                  className="text-xs sm:text-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-[85%] ml-auto text-white"
                  style={{ backgroundColor: merchant.widget_color }}
                >
                  Yes! 3–5 days, free over $75.
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2">
                <input
                  disabled
                  placeholder="Type a message..."
                  className="flex-1 text-xs sm:text-sm text-gray-400 bg-transparent outline-none"
                />
                <button
                  disabled
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: merchant.widget_color }}
                >
                  <Send size={12} className="sm:size-13" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Customize the widget name, brand color and avatar in{" "}
            <a href="/settings" className="text-blue-600 hover:underline">
              Settings → Widget Appearance
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}