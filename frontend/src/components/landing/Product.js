import ProductMockup from "./ProductMockup";

export default function Product() {
  return (
    <section
      id="product"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Product
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            See Wiz AI in Action
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            A single workspace to monitor conversations, manage your knowledge
            base, track AI performance, and support customers more efficiently.
          </p>

        </div>

        <ProductMockup />

      </div>
    </section>
  );
}