'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, ShoppingBag, Globe, Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'

const PLATFORMS = [
  { value: 'shopify', label: 'Shopify', icon: ShoppingBag },
  { value: 'woocommerce', label: 'WooCommerce', icon: Store },
  { value: 'wordpress', label: 'WordPress', icon: Globe },
  { value: 'custom', label: 'Custom', icon: Code2 },
]

const POLL_INTERVAL_MS = 2000

export default function NewWebsite() {
  const router = useRouter()
  const pollRef = useRef(null)

  const [step, setStep] = useState(1)

  // Shopify-specific state
  const [shopDomain, setShopDomain] = useState('')
  const [connectingShopify, setConnectingShopify] = useState(false)

  // Step 1 form state
  const [platform, setPlatform] = useState('')
  const [url, setUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Step 2 polling state
  const [websiteId, setWebsiteId] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [job, setJob] = useState(null)
  const [pollError, setPollError] = useState(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // Detect return from Shopify OAuth. This MUST run in useEffect, not in the
  // useState initializer above — useEffect only runs client-side, after
  // hydration. Reading window.location during the initial render would
  // produce a different result on the server (no window) vs the client
  // (has window), causing a React hydration mismatch.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('shopify') === 'connected') {
      setStep(3)
    }
  }, [])

  function isValidUrl(value) {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  async function handleStartCrawl(e) {
    e.preventDefault()
    setSubmitError(null)

    if (!platform) {
      setSubmitError('Please select a platform.')
      return
    }
    if (!url || !isValidUrl(url)) {
      setSubmitError('Please enter a valid URL, including https://')
      return
    }

    setSubmitting(true)
    try {
      const { data: website } = await api.post('/websites/', {
        url,
        platform,
        ...(accessToken ? { access_token: accessToken } : {}),
      })

      const { data: syncData } = await api.post(`/websites/${website.id}/sync/`)

      setWebsiteId(website.id)
      setJobId(syncData.job_id)
      setStep(2)
    } catch (err) {
      const message =
        err?.response?.data?.url?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Couldn't start the crawl. Please check the URL and try again."
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShopifyConnect() {
    setSubmitError(null)

    if (!shopDomain || !shopDomain.includes('.myshopify.com')) {
      setSubmitError('Please enter your store domain, e.g. your-store.myshopify.com')
      return
    }

    setConnectingShopify(true)
    try {
      const { data } = await api.post('/integrations/shopify/connect/', {
        shop_domain: shopDomain,
      })
      // Full redirect to Shopify's consent screen — not an axios call,
      // this leaves your app entirely and goes to Shopify's own domain.
      window.location.href = data.auth_url
    } catch (err) {
      setSubmitError("Couldn't start the Shopify connection. Please try again.")
      setConnectingShopify(false)
    }
  }

  // Step 2: poll job status
  useEffect(() => {
    if (step !== 2 || !jobId) return

    async function poll() {
      try {
        const { data } = await api.get(`/websites/jobs/${jobId}/`)
        setJob(data)

        if (data.status === 'completed') {
          clearInterval(pollRef.current)
          setStep(3)
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current)
          setPollError(data.error_message || 'The crawl failed. Please try again.')
        }
      } catch (err) {
        clearInterval(pollRef.current)
        setPollError("Lost connection while checking crawl progress. Please try again.")
      }
    }

    poll() // fire immediately, then on interval
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => clearInterval(pollRef.current)
  }, [step, jobId])

  function handleRetry() {
    if (pollRef.current) clearInterval(pollRef.current)
    setJob(null)
    setPollError(null)
    setJobId(null)
    setWebsiteId(null)
    setStep(1)
  }

  const progressPercent = job?.pages_total
    ? Math.min(100, Math.round((job.pages_done / job.pages_total) * 100))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {n}
              </div>
              {n < 3 && (
                <div className={`w-10 h-0.5 ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8">

          {/* STEP 1: Platform + URL */}
          {step === 1 && (
            <form onSubmit={handleStartCrawl}>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Connect your store</h1>
              <p className="text-sm text-gray-500 mb-6">
                Wiz will crawl your storefront and learn your content automatically.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PLATFORMS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlatform(value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition ${
                      platform === value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {platform === 'shopify' ? (
                <div>
                  <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Shopify store domain
                  </label>
                  <input
                    id="shopDomain"
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleShopifyConnect}
                    disabled={connectingShopify}
                    className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectingShopify ? 'Redirecting to Shopify…' : 'Connect with Shopify'}
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Store URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Access token <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Paste your store's API token"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mb-6">
                    Not required for V1. Adding this now enables richer features later, like product cards in chat.
                  </p>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Starting crawl…' : 'Connect and start crawl'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* STEP 2: Live progress */}
          {step === 2 && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {pollError ? 'Crawl failed' : 'Crawling your store'}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {pollError
                  ? "Something went wrong during the crawl."
                  : "This usually takes a minute or two, depending on your store's size."}
              </p>

              {pollError ? (
                <div>
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
                    <XCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{pollError}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    {!job?.pages_total
                      ? 'Getting started…'
                      : job.pages_done < job.pages_total
                      ? `Scraping page ${job.pages_done} of ${job.pages_total}`
                      : 'Finishing up — indexing content…'}
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Feel free to leave this page open — we&apos;ll take it from here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Your store is connected</h1>
              <p className="text-sm text-gray-500 mb-6">
                {job
                  ? "Wiz has learned your content and is ready to answer customer questions."
                  : "Your Shopify store is connected. Wiz will start learning your products shortly."}
              </p>

              {job && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-semibold text-gray-900">{job.pages_done}</p>
                    <p className="text-xs text-gray-400 mt-1">Pages crawled</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-semibold text-gray-900">{job.chunks_created}</p>
                    <p className="text-xs text-gray-400 mt-1">Chunks indexed</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Go to dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}