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
    <div
      className="rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden border"
      style={{ backgroundColor: "#ffffff", borderColor: "#f3c8d5" }}
    >
      <div className="p-5 sm:p-6 border-b border-black/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onToggle}
              className="p-2 rounded-full bg-white/70 hover:bg-white transition-colors"
            >
              {category.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{categoryName}</h3>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto md:ml-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-600">Grade</div>
                <div className="text-lg font-bold" style={{ color: "#6c584c" }}>
                  {gradeText}
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-sm text-gray-600">Weight</div>
                <div className="flex items-center gap-2">
                  {editingWeight === categoryName ? (
                    <input
                      type="number"
                      defaultValue={category.weight ?? ""}
                      onBlur={(e) => onUpdateWeight(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      className="w-24 px-2 py-1 rounded-full bg-white/80 ring-1 ring-black/5 text-center focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="text-lg font-bold">
                        {getWeightDisplay(category.weight)}
                      </span>
                      <button
                        onClick={onStartEditWeight}
                        className="p-1 rounded-full hover:bg-white/80"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 md:items-center">
              {category.weight !== null && (
                <button
                  onClick={openGradeCalculator}
                  className="p-2 rounded-full transition-colors ring-1 ring-black/5 bg-white/80 hover:bg-white"
                  title="Calculate required grade"
                >
                  <Target size={16} style={{ color: "#6c584c" }} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-2 rounded-full transition-colors ring-1 ring-black/5 bg-white/80 hover:bg-white"
              >
                <Trash2 size={16} style={{ color: "#b07a7a" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {category.expanded && (
        <div className="p-6 bg-white">
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
            className="mt-4 px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 mx-auto text-white hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#6c584c" }}
          >
            <Plus size={16} />
            {`Add ${categoryName}`}
          </button>
        </div>
      )}
    </div>
  );
}
