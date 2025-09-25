import { ChevronDown, ChevronRight, Edit3, Target, Trash2, Plus } from "lucide-react";
import AssignmentRow from "./AssignmentRow.jsx";

export default function CategoryCard({
  categoryName,
  category,
  gradeType,
  onToggle,
  onDelete,
  onStartEditWeight,
  onUpdateWeight,
  editingWeight,
  calculateCategoryAverage,
  getWeightDisplay,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  openGradeCalculator,
}) {
  const gradeText =
    category.weight === null
      ? `+${category.assignments.reduce((s, a) => s + parseFloat(a.grade || 0), 0)} pts`
      : `${calculateCategoryAverage(category.assignments).toFixed(1)}%`;

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur rounded-2xl shadow-lg overflow-hidden border border-pink-200">
      <div className="p-6 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
              {category.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="text-xl font-semibold text-gray-800">{categoryName}</h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">Grade</div>
              <div className="text-lg font-bold" style={{ color: "#6B73B5" }}>
                {gradeText}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Weight</div>
              <div className="flex items-center gap-2">
                {editingWeight === categoryName ? (
                  <input
                    type="number"
                    defaultValue={category.weight ?? ""}
                    onBlur={(e) => onUpdateWeight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    className="w-20 px-2 py-1 border border-pink-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-lg font-bold">
                      {getWeightDisplay(category.weight)}
                    </span>
                    <button
                      onClick={onStartEditWeight}
                      className="p-1 hover:bg-pink-50 rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {category.weight !== null && (
                <button
                  onClick={openGradeCalculator}
                  className="p-2 rounded-lg transition-colors border border-yellow-300"
                  style={{ backgroundColor: "#F5E6A3" }}
                  title="Calculate required grade"
                >
                  <Target size={16} style={{ color: "#d97706" }} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-2 rounded-lg transition-colors border border-red-200"
                style={{ backgroundColor: "#F4A5A5" }}
              >
                <Trash2 size={16} className="text-red-800" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {category.expanded && (
        <div className="p-6 bg-yellow-50 bg-opacity-80">
          <div className="space-y-3">
            {category.assignments.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                onChangeName={(v) => updateAssignment("name", a.id, v)}
                onChangeGrade={(v) => updateAssignment("grade", a.id, v)}
                onChangeMax={(v) => updateAssignment("maxPoints", a.id, v)}
                onDelete={() => deleteAssignment(a.id)}
              />
            ))}
          </div>

          <button
            onClick={addAssignment}
            className="mt-4 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto text-white hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#6B73B5" }}
          >
            <Plus size={16} />
            Add Assignment
          </button>
        </div>
      )}
    </div>
  );
}
