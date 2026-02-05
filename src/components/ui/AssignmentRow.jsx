import { Trash2 } from "lucide-react";

export default function AssignmentRow({
  assignment,
  onChangeName,
  onChangeGrade,
  onChangeMax,
  onDelete,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <input
        type="text"
        value={assignment.name}
        onChange={(e) => onChangeName(e.target.value)}
        className="w-full sm:flex-1 px-3 py-2 border-0 bg-[#f7f2ed] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30 transition-colors"
      />
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="number"
          value={assignment.grade ?? ""}
          onChange={(e) => onChangeGrade(e.target.value)}
          placeholder="Grade"
          className="w-full sm:w-24 px-3 py-2 border-0 bg-[#f7f2ed] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30 text-center transition-colors"
        />
        <span className="text-gray-500 font-medium hidden sm:inline">/</span>
        <input
          type="number"
          value={assignment.maxPoints}
          onChange={(e) => onChangeMax(e.target.value)}
          className="w-full sm:w-24 px-3 py-2 border-0 bg-[#f7f2ed] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30 text-center transition-colors"
        />
      </div>
      <button
        onClick={onDelete}
        className="p-2 rounded-full bg-white ring-1 ring-black/5 hover:bg-[#f7f2ed] transition-colors self-end sm:self-auto"
        style={{ color: "#b07a7a" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
