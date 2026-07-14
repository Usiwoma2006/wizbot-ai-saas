import Link from "next/link";
import HeroMockup from "./HeroMockup";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12">
        {/* Left column: text content */}
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600">
            AI trained on your store
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            AI Customer Support{" "}
            <span className="text-blue-600">That Knows Your Store.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
            Train an AI assistant on your website in minutes. Answer customer
            questions instantly, reduce support workload, increase
            satisfaction, and grow sales.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="#demo"
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Book Demo
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            ✓ 5-minute setup &nbsp; ✓ No credit card
          </p>
        </div>

        {/* Right column: visual */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}