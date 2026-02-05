import { X } from "lucide-react";

export default function GradeCalculatorModal({
  open,
  categoryName,
  targetGrade,
  setTargetGrade,
  nextAssignmentPoints,
  setNextAssignmentPoints,
  computeRequiredAvg,
  computeRequiredNextAssignment,
  onClose,
}) {
  if (!open) return null;

  const requiredAvg =
    targetGrade !== "" ? computeRequiredAvg(Number(targetGrade)) : null;

  const requiredNext =
    targetGrade !== "" && nextAssignmentPoints !== ""
      ? computeRequiredNextAssignment(Number(targetGrade), Number(nextAssignmentPoints))
      : null;

  const percentForNext =
    requiredNext && nextAssignmentPoints
      ? ((Number(requiredNext) / Number(nextAssignmentPoints)) * 100).toFixed(1)
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md border border-pink-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#6c584c" }}>
            Grade Calculator — {categoryName}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="number"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            placeholder="Target overall grade (%)"
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {requiredAvg !== null && (
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800">
                <strong>Required average in {categoryName}: {requiredAvg}%</strong>
              </p>
            </div>
          )}

          <input
            type="number"
            value={nextAssignmentPoints}
            onChange={(e) => setNextAssignmentPoints(e.target.value)}
            placeholder="Points possible on next assignment"
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {requiredNext !== null && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">
                <strong>
                  Required grade on next assignment: {requiredNext} / {nextAssignmentPoints} points
                </strong>
              </p>
              <p className="text-green-700 text-sm mt-2">
                That’s {percentForNext}% on this assignment.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#6c584c" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
