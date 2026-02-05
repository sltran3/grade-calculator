import { X } from "lucide-react";

export default function NewClassModal({ open, onClose, form, setForm, onAdd }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md border border-pink-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#6c584c" }}>
            Add New Course
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
            placeholder="Course name"
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => e.key === "Enter" && form.name.trim() && onAdd()}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Type</label>
            <select
              value={form.gradeType}
              onChange={(e) => setForm((p) => ({ ...p, gradeType: e.target.value }))}
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="percent">Percentage</option>
              <option value="points">Points</option>
            </select>
          </div>

          {form.gradeType === "points" && (
            <input
              type="number"
              value={form.totalPoints}
              onChange={(e) =>
                setForm((p) => ({ ...p, totalPoints: parseInt(e.target.value) || 0 }))
              }
              placeholder="Total points"
              min="1"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onAdd}
              className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#6c584c" }}
              disabled={!form.name.trim()}
            >
              Add Course
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
