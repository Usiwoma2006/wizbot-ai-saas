const ArticleCard = ({
  title,
  source,
  note,
  chunks,
  onPreview,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{source}</p>
      <p className="mt-4 text-sm text-gray-600">{note}</p>
      <p className="mt-4 text-sm text-gray-400">{chunks} chunks</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={onPreview}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Preview
        </button>

        <button
          onClick={onEdit}
          className="text-gray-700 text-sm font-medium hover:underline"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="text-red-600 text-sm font-medium hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;