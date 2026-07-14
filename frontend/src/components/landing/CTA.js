import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-3xl bg-blue-600 px-8 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to Automate Customer Support?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
          Join hundreds of businesses using Wiz AI to deliver instant,
          accurate customer answers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Start Free
          </Link>

          <Link
            href="#demo"
            className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
}