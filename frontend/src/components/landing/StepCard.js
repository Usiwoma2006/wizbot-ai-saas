import { ChevronRight } from "lucide-react";
export default function StepCard({
  number,
  icon: Icon,
  title,
  description,
  isLast,
}) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl">

      {/* Step Number */}
      <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg">
        {number}
      </div>

      {/* Icon */}
      <div className="mb-6 mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={28} />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="leading-7 text-gray-600">
        {description}
      </p>
      {!isLast && (
  <div className="absolute left-full top-1/2 hidden -translate-y-1/2 items-center xl:flex">
    <div className="h-0.5 w-8 bg-blue-200" />

    <ChevronRight
      size={16}
      className="-ml-1 text-blue-300"
    />
  </div>
)}
    </div>
  );
}