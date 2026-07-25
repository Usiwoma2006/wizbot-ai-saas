export default function FilterTabs() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
        All
      </button>

      <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50">
        Website
      </button>

      <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50">
        Custom
      </button>

      <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50">
        Needs Review
      </button>
    </div>
  );
}