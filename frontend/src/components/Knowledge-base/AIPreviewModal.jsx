"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import api from "@/lib/api";

const AIPreviewModal = ({ isOpen, onClose, suggestedQuestions }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const canAnswer = result ? result.can_answer : false;

  async function askQuestion(question) {
    if (!question.trim()) return;
    setInputValue(question);
    setSelectedQuestion(question);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post('/dashboard/preview/', { question });
      setResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAsk() {
    askQuestion(inputValue);
  }

  function handleSuggestedClick(question) {
    askQuestion(question);
  }

  function handleClose() {
    setInputValue("");
    setSelectedQuestion(null);
    setResult(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-600" size={22} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Preview</h2>
              <p className="text-sm text-gray-500">
                Test how Wiz AI answers customer questions.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close preview"
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Ask as a customer */}
          <div>
            <label htmlFor="ai-preview-question" className="block mb-2 text-sm font-medium text-gray-700">
              Ask as a customer
            </label>

            <div className="flex gap-2">
              <input
                id="ai-preview-question"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder='e.g. "Do you ship internationally?"'
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAsk}
                disabled={!inputValue.trim() || loading}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ask
              </button>
            </div>
          </div>

          {/* Suggested Questions */}
          <div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedClick(q)}
                  disabled={loading}
                  className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-50 ${
                    selectedQuestion === q
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Nothing renders below this line until a question has been asked */}
          {selectedQuestion && (
            loading ? (
              <p className="text-sm text-gray-500">Thinking...</p>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                Something went wrong. Please try again.
              </div>
            ) : canAnswer ? (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">AI Answer</h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm leading-7 text-gray-700">{result.answer}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">Sources Used</p>
                    <ul className="mt-1 text-sm text-gray-900">
                      {result.sources.map((s, i) => (
                        <li key={i}>{s.title}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">Chunks Used</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {result.chunks.length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <h3 className="font-semibold text-yellow-900">No knowledge found</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Your AI doesn&apos;t have information to answer this question yet.
                </p>
                <button className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">
                  + Create Custom Article
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 p-6">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPreviewModal;