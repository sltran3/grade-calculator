import { Trash2 } from "lucide-react";

export default function AssignmentRow({
  assignment,
  onChangeName,
  onChangeGrade,
  onChangeMax,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <input
        type="text"
        value={assignment.name}
        onChange={(e) => onChangeName(e.target.value)}
        className="flex-1 px-3 py-2 border-0 bg-pink-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:bg-pink-100 transition-colors"
      />
      <input
        type="number"
        value={assignment.grade ?? ""}
        onChange={(e) => onChangeGrade(e.target.value)}
        placeholder="Grade"
        className="w-24 px-3 py-2 border-0 bg-pink-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center hover:bg-pink-100 transition-colors"
      />
      <span className="text-gray-500 font-medium">/</span>
      <input
        type="number"
        value={assignment.maxPoints}
        onChange={(e) => onChangeMax(e.target.value)}
        className="w-24 px-3 py-2 border-0 bg-pink-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center hover:bg-pink-100 transition-colors"
      />
      <button
        onClick={onDelete}
        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
        style={{ color: "#F4A5A5" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
