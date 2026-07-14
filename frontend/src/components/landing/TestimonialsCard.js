import { Star } from "lucide-react";

export default function TestimonialCard({
  quote,
  name,
  role,
  company,
}) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      <p className="mb-6 leading-7 text-gray-600">&quot;{quote}&quot;</p>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
          {name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
}