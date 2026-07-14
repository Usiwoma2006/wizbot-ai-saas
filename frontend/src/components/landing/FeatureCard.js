export default function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={28} />
      </div>

      <h3 className="mb-3 text-xl font-semibold text-gray-900">
        {title}
      </h3>

      <p className="leading-7 text-gray-600">
        {description}
      </p>
    </div>
  );
}