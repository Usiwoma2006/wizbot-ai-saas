const companies = [
  "Shopify",
  "WooCommerce",
  "BigCommerce",
  "Magento",
];

export default function TrustedCompanies() {
  return (
    <section className="border-t border-gray-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">

        <p className="mb-10 text-center text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
          Built for leading ecommerce platforms
        </p>

        <div className="relative overflow-hidden">

          <div className="flex w-max animate-scroll items-center gap-24">

            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="shrink-0 text-2xl font-bold tracking-tight text-gray-400 transition duration-300 hover:text-blue-600"
              >
                {company}
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}