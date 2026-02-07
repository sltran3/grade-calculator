import React, { useEffect, useRef, useState } from "react";
import { Edit3, Plus, RotateCcw } from "lucide-react";
import useGradeCalculations from "../hooks/useGradeCalculations.js";
import CategoryCard from "./ui/CategoryCard.jsx";
import NewClassModal from "./modals/NewClassModal.jsx";
import AddCategoryModal from "./modals/AddCategoryModal.jsx";
import WeightWarningModal from "./modals/WeightWarningModal.jsx";
import GradeCalculatorModal from "./modals/GradeCalculatorModal.jsx";
import { getCurrentTotalWeight as _getTotal } from "../utils/gradeUtils.js";

const STORAGE_KEY = "grade-calculator-state";
const DEFAULT_CLASSES = {
  "Course 1": { id: 1, gradeType: "percent", totalPoints: 1000, categories: {} },
};

const loadStoredState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.classes || typeof parsed.classes !== "object") return null;
    const classNames = Object.keys(parsed.classes);
    if (classNames.length === 0) return null;
    const activeClass = classNames.includes(parsed.activeClass)
      ? parsed.activeClass
      : classNames[0];
    return { classes: parsed.classes, activeClass };
  } catch {
    return null;
  }
};

export default function GradeCalculator() {
  const storedState = loadStoredState();
  const [classes, setClasses] = useState(storedState?.classes ?? DEFAULT_CLASSES);
  const [activeClass, setActiveClass] = useState(
    storedState?.activeClass ?? Object.keys(DEFAULT_CLASSES)[0]
  );

  // UI state
  const [showNewClassForm, setShowNewClassForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const [editingWeight, setEditingWeight] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [isEditingCourseName, setIsEditingCourseName] = useState(false);
  const [courseNameDraft, setCourseNameDraft] = useState("");
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showOverallPoints, setShowOverallPoints] = useState(false);
  const courseMenuRef = useRef(null);

  // Grade calculator modal
  const [calcCategory, setCalcCategory] = useState(null);
  const [targetGrade, setTargetGrade] = useState("");
  const [nextAssignmentPoints, setNextAssignmentPoints] = useState("");

  const [newClassForm, setNewClassForm] = useState({
    name: "",
    gradeType: "percent",
    totalPoints: 1000,
  });
  const [newCategoryForm, setNewCategoryForm] = useState({ name: "", weight: "" });

  const {
    currentClass,
    overallGrade,
    calculateCategoryAverage,
    calculateRequiredGrade,
    calculateNextAssignmentGrade,
    getWeightDisplay,
    getCurrentTotalWeight,
  } = useGradeCalculations(classes, activeClass);

  // Escape to close any modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowNewClassForm(false);
        setShowAddCategoryForm(false);
        setShowWeightWarning(false);
        setCalcCategory(null);
        setEditingWeight(null);
        setShowCourseMenu(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!showCourseMenu) return;
    const handleClickOutside = (event) => {
      if (!courseMenuRef.current) return;
      if (!courseMenuRef.current.contains(event.target)) {
        setShowCourseMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCourseMenu]);

  useEffect(() => {
    setShowOverallPoints(false);
  }, [activeClass, classes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ classes, activeClass })
      );
    } catch {
      // Ignore storage failures (quota, privacy mode, etc.)
    }
  }, [classes, activeClass]);

  // ---- class ops ----
  const addClass = () => {
    if (!newClassForm.name.trim()) return;
    setClasses((prev) => ({
      ...prev,
      [newClassForm.name]: {
        id: Date.now(),
        gradeType: newClassForm.gradeType,
        totalPoints: newClassForm.totalPoints,
        categories: {},
      },
    }));
    setActiveClass(newClassForm.name);
    setNewClassForm({ name: "", gradeType: "percent", totalPoints: 1000 });
    setShowNewClassForm(false);
  };

  const deleteClass = (className) => {
    if (Object.keys(classes).length <= 1) return;
    const n = { ...classes };
    delete n[className];
    setClasses(n);
    if (activeClass === className) setActiveClass(Object.keys(n)[0]);
  };

  const startEditCourseName = () => {
    setCourseNameDraft(activeClass);
    setIsEditingCourseName(true);
  };

  const cancelEditCourseName = () => {
    setIsEditingCourseName(false);
    setCourseNameDraft("");
  };

  const saveCourseName = () => {
    const nextName = courseNameDraft.trim();
    if (!nextName) return;
    if (nextName !== activeClass && classes[nextName]) {
      window.alert("A course with that name already exists.");
      return;
    }
    if (nextName === activeClass) {
      cancelEditCourseName();
      return;
    }
    setClasses((prev) => {
      const updated = { ...prev };
      const existing = updated[activeClass];
      delete updated[activeClass];
      updated[nextName] = existing;
      return updated;
    });
    setActiveClass(nextName);
    cancelEditCourseName();
  };

  const deleteCourseAndReset = () => {
    const ok = window.confirm("Delete this course and reset to the default?");
    if (!ok) return;
    setClasses(DEFAULT_CLASSES);
    setActiveClass(Object.keys(DEFAULT_CLASSES)[0]);
    setIsEditingCourseName(false);
    setCourseNameDraft("");
    setShowCourseMenu(false);
  };

  // ---- category ops ----
  const addCategory = () => {
    if (!newCategoryForm.name.trim()) return;
    const weight = newCategoryForm.weight === "" ? null : parseFloat(newCategoryForm.weight);

    setClasses((prev) => {
      const cur = prev[activeClass];
      const curTotal = Object.values(cur.categories)
        .filter((c) => c.weight !== null)
        .reduce((s, c) => s + c.weight, 0);
      const maxAllowed = cur.gradeType === "percent" ? 100 : cur.totalPoints;

      if (weight !== null && curTotal + weight > maxAllowed) {
        setPendingCategory({ name: newCategoryForm.name, weight });
        setShowWeightWarning(true);
        return prev;
      }

      const updated = {
        ...prev,
        [activeClass]: {
          ...cur,
          categories: {
            ...cur.categories,
            [newCategoryForm.name]: { id: Date.now(), weight, assignments: [], expanded: false },
          },
        },
      };
      setNewCategoryForm({ name: "", weight: "" });
      setShowAddCategoryForm(false);
      return updated;
    });
  };

  const confirmAddCategory = (name, weight) => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [name]: { id: Date.now(), weight, assignments: [], expanded: false },
        },
      },
    }));
    setShowWeightWarning(false);
    setPendingCategory(null);
    setNewCategoryForm({ name: "", weight: "" });
    setShowAddCategoryForm(false);
  };

  const updateCategoryWeight = (categoryName, newWeight) => {
    const weight = newWeight === "" ? null : parseFloat(newWeight);

    setClasses((prev) => {
      const cur = prev[activeClass];
      const curTotalExcl = Object.entries(cur.categories)
        .filter(([name, c]) => name !== categoryName && c.weight !== null)
        .reduce((s, [, c]) => s + c.weight, 0);
      const maxAllowed = cur.gradeType === "percent" ? 100 : cur.totalPoints;

      if (weight !== null && curTotalExcl + weight > maxAllowed) {
        setPendingCategory({ name: categoryName, weight, isUpdate: true });
        setShowWeightWarning(true);
        return prev;
      }

      const updated = {
        ...prev,
        [activeClass]: {
          ...cur,
          categories: {
            ...cur.categories,
            [categoryName]: { ...cur.categories[categoryName], weight },
          },
        },
      };
      setEditingWeight(null);
      return updated;
    });
  };

  const confirmWeightUpdate = () => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [pendingCategory.name]: {
            ...prev[activeClass].categories[pendingCategory.name],
            weight: pendingCategory.weight,
          },
        },
      },
    }));
    setEditingWeight(null);
    setShowWeightWarning(false);
    setPendingCategory(null);
  };

  const deleteCategory = (categoryName) => {
    setClasses((prev) => {
      const cats = { ...prev[activeClass].categories };
      delete cats[categoryName];
      return { ...prev, [activeClass]: { ...prev[activeClass], categories: cats } };
    });
  };

  const resetCategories = () => {
    if (!currentClass) return;
    const ok = window.confirm("Reset all categories for this course?");
    if (!ok) return;
    setClasses((prev) => ({
      ...prev,
      [activeClass]: { ...prev[activeClass], categories: {} },
    }));
    setEditingWeight(null);
    setCalcCategory(null);
  };

  const toggleCategory = (name) => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [name]: {
            ...prev[activeClass].categories[name],
            expanded: !prev[activeClass].categories[name].expanded,
          },
        },
      },
    }));
  };

  // ---- assignment ops ----
  const addAssignment = (categoryName) => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [categoryName]: {
            ...prev[activeClass].categories[categoryName],
            assignments: [
              ...prev[activeClass].categories[categoryName].assignments,
              {
                id: Date.now(),
                name: `${categoryName} ${prev[activeClass].categories[categoryName].assignments.length + 1}`,
                grade: null,
                maxPoints: 100,
              },
            ],
          },
        },
      },
    }));
  };

  const updateAssignment = (categoryName, assignmentId, field, value) => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [categoryName]: {
            ...prev[activeClass].categories[categoryName],
            assignments: prev[activeClass].categories[categoryName].assignments.map((a) =>
              a.id === assignmentId ? { ...a, [field]: value } : a
            ),
          },
        },
      },
    }));
  };

  const deleteAssignment = (categoryName, assignmentId) => {
    setClasses((prev) => ({
      ...prev,
      [activeClass]: {
        ...prev[activeClass],
        categories: {
          ...prev[activeClass].categories,
          [categoryName]: {
            ...prev[activeClass].categories[categoryName],
            assignments: prev[activeClass].categories[categoryName].assignments.filter(
              (a) => a.id !== assignmentId
            ),
          },
        },
      },
    }));
  };

  // ----- render -----
  const header = (
    <div
      className="bg-white rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-5 sm:p-6 mb-6 border"
      style={{ borderColor: "#f3c8d5" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/cat.png"
            alt="Cat icon"
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <h1
            className="font-display text-3xl sm:text-4xl font-bold leading-tight"
            style={{ color: "#6c584c" }}
          >
            Grade Calculator
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-600 mb-1">Overall Grade</div>
          <div className="relative inline-flex group">
            <button
              type="button"
              onClick={() => {
                if (currentClass?.gradeType === "points") {
                  setShowOverallPoints((prev) => !prev);
                }
              }}
              className={`text-2xl sm:text-3xl font-bold ${
                currentClass?.gradeType === "points" ? "cursor-pointer" : "cursor-default"
              }`}
              style={{ color: "#6c584c" }}
              title={
                currentClass?.gradeType === "points"
                  ? "Click to toggle percent/points"
                  : undefined
              }
            >
              {currentClass?.gradeType === "points"
                ? showOverallPoints
                  ? `${overallGrade.toFixed(1)} / ${currentClass?.totalPoints || 0}`
                  : `${(
                      (overallGrade / Math.max(currentClass?.totalPoints || 1, 1)) *
                      100
                    ).toFixed(1)}%`
                : `${overallGrade.toFixed(1)}%`}
            </button>
            {currentClass?.gradeType === "points" && (
              <span className="pointer-events-none absolute -top-7 right-0 rounded-full bg-white px-2 py-1 text-xs text-[#6c584c] shadow-[0_6px_20px_rgba(0,0,0,0.08)] opacity-0 transition-opacity group-hover:opacity-100">
                {showOverallPoints ? "Click to see Percent" : "Click to see Points"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <select
            value={activeClass}
            onChange={(e) => setActiveClass(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30 ring-1 ring-black/5"
            disabled={isEditingCourseName}
          >
            {Object.keys(classes).map((cn) => (
              <option key={cn} value={cn}>
                {cn}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <div className="relative" ref={courseMenuRef}>
              <button
                onClick={() => setShowCourseMenu((prev) => !prev)}
                className="p-2 rounded-full bg-white ring-1 ring-black/5 hover:bg-[#f7f2ed] transition-colors"
                style={{ color: "#6c584c" }}
                aria-label="Course options"
                title="Course options"
              >
                <Edit3 size={16} />
              </button>
              {showCourseMenu && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 z-10">
                  <button
                    onClick={() => {
                      startEditCourseName();
                      setShowCourseMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#f7f2ed] rounded-t-xl"
                    style={{ color: "#6c584c" }}
                  >
                    Edit course name
                  </button>
                  <button
                    onClick={deleteCourseAndReset}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#f7f2ed] rounded-b-xl"
                    style={{ color: "#b07a7a" }}
                  >
                    Delete course
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={resetCategories}
              className="p-2 rounded-full bg-white ring-1 ring-black/5 hover:bg-[#f7f2ed] transition-colors"
              style={{ color: "#6c584c" }}
              aria-label="Reset categories"
              title="Reset categories"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowNewClassForm(true)}
          className="w-full sm:w-auto px-6 py-2 text-white rounded-full hover:opacity-90 transition-all duration-200 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: "#6c584c" }}
        >
          New Course
        </button>

        {Object.keys(classes).length > 1 && (
          <button
            onClick={() => deleteClass(activeClass)}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-full hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#d6a7a7" }}
          >
            Delete Course
          </button>
        )}
      </div>

      {isEditingCourseName && (
        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={courseNameDraft}
            onChange={(e) => setCourseNameDraft(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 rounded-full bg-white ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#6c584c]/30"
            placeholder="Course name"
            onKeyDown={(e) => e.key === "Enter" && saveCourseName()}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={saveCourseName}
              className="flex-1 sm:flex-none px-4 py-2 text-white rounded-full hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "#6c584c" }}
              disabled={!courseNameDraft.trim()}
            >
              Save
            </button>
            <button
              onClick={cancelEditCourseName}
              className="flex-1 sm:flex-none px-4 py-2 text-[#6c584c] rounded-full hover:opacity-90 transition-all duration-200 bg-white ring-1 ring-black/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const currentWeightText = currentClass
    ? `${_getTotal(currentClass)}${currentClass.gradeType === "points" ? " pts" : "%"} / ${
        currentClass.gradeType === "points" ? `${currentClass.totalPoints} pts` : "100%"
      }`
    : "";

  const afterAddText =
    newCategoryForm.weight && currentClass
      ? `${_getTotal(currentClass) + parseFloat(newCategoryForm.weight)}${
          currentClass.gradeType === "points" ? " pts" : "%"
        }`
      : "";

  return (
    <div className="min-h-screen relative">
      {/* App bg */}
      <div className="fixed inset-0" style={{ backgroundColor: "#e3d5ca" }} />
      <div className="relative min-h-screen">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {header}

          {/* Categories */}
          <div className="space-y-4">
            {currentClass &&
              Object.entries(currentClass.categories).map(([name, cat]) => (
                <CategoryCard
                  key={name}
                  categoryName={name}
                  category={cat}
                  gradeType={currentClass.gradeType}
                  onToggle={() => toggleCategory(name)}
                  onDelete={() => deleteCategory(name)}
                  onStartEditWeight={() => setEditingWeight(name)}
                  onUpdateWeight={(val) => updateCategoryWeight(name, val)}
                  editingWeight={editingWeight}
                  calculateCategoryAverage={calculateCategoryAverage}
                  getWeightDisplay={(w) => getWeightDisplay(w)}
                  addAssignment={() => addAssignment(name)}
                  updateAssignment={(field, id, val) => updateAssignment(name, id, field, val)}
                  deleteAssignment={(id) => deleteAssignment(name, id)}
                  openGradeCalculator={() => {
                    setCalcCategory(name);
                    setTargetGrade("");
                    setNextAssignmentPoints("");
                  }}
                />
              ))}

            <button
              onClick={() => setShowAddCategoryForm(true)}
            className="w-full p-6 bg-white border border-dashed rounded-[28px] hover:bg-[#f7f2ed] transition-all duration-200 flex items-center justify-center gap-3 font-medium"
            style={{ color: "#6c584c", borderColor: "#f3c8d5" }}
            >
              <Plus size={24} />
              Add New Category
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewClassModal
        open={showNewClassForm}
        onClose={() => {
          setShowNewClassForm(false);
          setNewClassForm({ name: "", gradeType: "percent", totalPoints: 1000 });
        }}
        form={newClassForm}
        setForm={setNewClassForm}
        onAdd={addClass}
      />

      <AddCategoryModal
        open={showAddCategoryForm}
        onClose={() => {
          setShowAddCategoryForm(false);
          setNewCategoryForm({ name: "", weight: "" });
        }}
        form={newCategoryForm}
        setForm={setNewCategoryForm}
        onAdd={addCategory}
        currentTotalWeightText={currentWeightText}
        afterAddText={afterAddText}
      />

      <WeightWarningModal
        open={showWeightWarning && !!pendingCategory}
        text={
          pendingCategory && currentClass
            ? `The weight you entered (${pendingCategory.weight}${
                currentClass.gradeType === "percent" ? "%" : " pts"
              }) would make the total weight ${_getTotal(currentClass) + pendingCategory.weight}${
                currentClass.gradeType === "percent" ? "%" : " pts"
              }, which exceeds the maximum allowed (${
                currentClass.gradeType === "percent" ? "100%" : `${currentClass.totalPoints} pts`
              }). Continue?`
            : ""
        }
        onContinue={() => {
          if (!pendingCategory) return;
          if (pendingCategory.isUpdate) {
            confirmWeightUpdate();
          } else {
            confirmAddCategory(pendingCategory.name, pendingCategory.weight);
          }
        }}
        onBack={() => {
          setShowWeightWarning(false);
          setPendingCategory(null);
          setEditingWeight(null);
        }}
      />

      <GradeCalculatorModal
        open={!!calcCategory}
        categoryName={calcCategory}
        targetGrade={targetGrade}
        setTargetGrade={setTargetGrade}
        nextAssignmentPoints={nextAssignmentPoints}
        setNextAssignmentPoints={setNextAssignmentPoints}
        computeRequiredAvg={(t) => calculateRequiredGrade(calcCategory, t)}
        computeRequiredNextAssignment={(t, pts) =>
          calculateNextAssignmentGrade(calcCategory, t, pts)
        }
        onClose={() => {
          setCalcCategory(null);
          setTargetGrade("");
          setNextAssignmentPoints("");
        }}
      />
    </div>
  );
}
