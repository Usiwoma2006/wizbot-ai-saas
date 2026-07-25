const PreviewDrawer = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;

  const { title, source, status, url, lastUpdated, content, chunks, similarity } = article;

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Article Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        {/* Article Information */}
        <div className="p-6">
          <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>

          <span className="inline-block mt-3 rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1">
            {source}
          </span>

          <span className="ml-2 inline-block rounded-full bg-green-100 text-green-700 text-xs font-medium px-3 py-1">
            {status}
          </span>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <p className="text-sm text-gray-500">URL</p>
              <p className="text-sm text-gray-900 break-all">{url}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Sync</p>
              <p className="text-sm text-gray-900">{lastUpdated}</p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Article Content</h4>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{content}</p>
            </div>
          </div>

          {/* AI Information */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Chunks</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{chunks}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Similarity</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{similarity}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Re-embed
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewDrawer;