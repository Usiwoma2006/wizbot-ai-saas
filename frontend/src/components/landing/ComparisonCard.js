import { Check, X } from "lucide-react";

export default function ComparisonCard({
  title,
  items,
  positive,
}) {
  return (
    <div
      className={`rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        positive
          ? "border-[2.5px] border-blue-500 bg-white"
          : "border-gray-200 bg-white"
      }`}
    >
      <h3 className="mb-8 text-xl font-semibold text-gray-900">
        {title}
      </h3>

      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                positive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {positive ? <Check size={14} /> : <X size={14} />}
            </div>

            <span className="text-gray-700">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}