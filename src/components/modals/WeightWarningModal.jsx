import { AlertTriangle } from "lucide-react";

export default function WeightWarningModal({
  open,
  text,
  onContinue,
  onBack,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md border border-pink-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle style={{ color: "#F5E6A3" }} size={24} />
          <h3 className="text-xl font-semibold" style={{ color: "#6c584c" }}>
            Weight Warning
          </h3>
        </div>

        <p className="text-gray-600 mb-6">{text}</p>

        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: "#F5E6A3", color: "#d97706" }}
          >
            Continue Anyway
          </button>
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 text-gray-700 rounded-lg hover:opacity-90 transition-colors border border-pink-200"
            style={{ backgroundColor: "#F4A5A5" }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
