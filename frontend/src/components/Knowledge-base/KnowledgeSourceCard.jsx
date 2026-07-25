const KnowledgeSourceCard = ({
  title,
  badge,
  badgeColor = "green",
  number,
  label,
  time,
  button,
}) => {
  const badgeStyles = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      {/* Badge */}
      <span
        className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-medium ${
          badgeStyles[badgeColor]
        }`}
      >
        {badge}
      </span>

      {/* Main Statistic */}
      <div className="mt-6">
        <p className="text-3xl font-semibold text-gray-900">
          {number}
        </p>

        <p className="text-sm text-gray-500">
          {label}
        </p>
      </div>

      {/* Last Updated */}
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Last Updated
        </p>

        <p className="text-sm text-gray-900">
          {time}
        </p>
      </div>

      {/* Action Button */}
      <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition">
        {button}
      </button>

    </div>
  );
};

export default KnowledgeSourceCard;