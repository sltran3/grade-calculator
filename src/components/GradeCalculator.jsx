import React, { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import useGradeCalculations from "../hooks/useGradeCalculations.js";
import CategoryCard from "./ui/CategoryCard.jsx";
import NewClassModal from "./modals/NewClassModal.jsx";
import AddCategoryModal from "./modals/AddCategoryModal.jsx";
import WeightWarningModal from "./modals/WeightWarningModal.jsx";
import GradeCalculatorModal from "./modals/GradeCalculatorModal.jsx";
import { getCurrentTotalWeight as _getTotal } from "../utils/gradeUtils.js";

export default function GradeCalculator() {
  const [classes, setClasses] = useState({
    "Course 1": { id: 1, gradeType: "percent", totalPoints: 1000, categories: {} },
  });
  const [activeClass, setActiveClass] = useState("Course 1");

  // UI state
  const [showNewClassForm, setShowNewClassForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const [editingWeight, setEditingWeight] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);

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
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
                name: `Assignment ${prev[activeClass].categories[categoryName].assignments.length + 1}`,
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
    <div className="bg-white bg-opacity-95 backdrop-blur rounded-2xl shadow-lg p-6 mb-6 border border-pink-200">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "#6B73B5" }}>
          <BookOpen size={32} />
          Grade Calculator
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Overall Grade</div>
          <div className="text-3xl font-bold" style={{ color: "#6B73B5" }}>
            {currentClass?.gradeType === "percent"
              ? `${overallGrade.toFixed(1)}%`
              : `${overallGrade.toFixed(1)}/${currentClass?.totalPoints || 1000}`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={activeClass}
          onChange={(e) => setActiveClass(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white bg-opacity-90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-300 border-pink-200"
        >
          {Object.keys(classes).map((cn) => (
            <option key={cn} value={cn}>
              {cn}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowNewClassForm(true)}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-md"
          style={{ backgroundColor: "#6B73B5" }}
        >
          New Course
        </button>

        {Object.keys(classes).length > 1 && (
          <button
            onClick={() => deleteClass(activeClass)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#F4A5A5" }}
          >
            Delete Course
          </button>
        )}
      </div>
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
      {/* Pink bg */}
      <div className="fixed inset-0" style={{ backgroundColor: "#f8bbd9" }} />
      <div className="relative min-h-screen bg-white bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-6">
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
              className="w-full p-6 bg-white bg-opacity-70 backdrop-blur border-2 border-dashed rounded-2xl hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-3 font-medium border-pink-300"
              style={{ color: "#6B73B5" }}
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
