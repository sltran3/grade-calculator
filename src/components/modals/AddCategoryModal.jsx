import { X } from "lucide-react";

export default function AddCategoryModal({
  open,
  onClose,
  form,
  setForm,
  onAdd,
  currentTotalWeightText,
  afterAddText,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-pink-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#6B73B5" }}>
            Add New Category
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Category name"
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => e.key === "Enter" && form.name.trim() && onAdd()}
          />
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
            placeholder="Weight (leave empty for extra credit)"
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => e.key === "Enter" && form.name.trim() && onAdd()}
          />

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>Current Total Weight:</strong> {currentTotalWeightText}</p>
            {afterAddText && <p className="mt-1"><strong>After adding:</strong> {afterAddText}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onAdd}
              className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#6B73B5" }}
              disabled={!form.name.trim()}
            >
              Add Category
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 rounded-lg hover:opacity-90 transition-colors border border-pink-200"
              style={{ backgroundColor: "#F5E6A3" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
