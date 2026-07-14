"use client";

import { Plus, Minus } from "lucide-react";

export default function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>

        {isOpen ? (
          <Minus className="text-blue-600" size={20} />
        ) : (
          <Plus className="text-gray-500" size={20} />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-6 pb-6 pt-4">
          <p className="leading-7 text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}