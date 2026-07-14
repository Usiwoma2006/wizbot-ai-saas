import { Check } from "lucide-react";
import Link from "next/link";

export default function PriceCard({
  plan,
  price,
  description,
  items,
  popular,
}) {
  return (
    <div
      className={`rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        popular
          ? "border-[2.5px] border-blue-500 bg-white relative"
          : "border-gray-200 bg-white"
      }`}
    >
      {popular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <p className="mb-2 text-sm font-semibold text-gray-600">{plan}</p>

      <h3 className="mb-2 text-4xl font-bold text-gray-900">{price}</h3>

      <p className="mb-8 leading-7 text-gray-600">{description}</p>

      <div className="mb-8 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Check size={16} className="text-blue-600" />
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>

      <Link
        href="/register"
        className={`block rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition ${
          popular
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}