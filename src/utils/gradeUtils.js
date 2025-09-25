export const calculateCategoryAverage = (assignments) => {
  const completed = assignments.filter(a => a.grade !== null && a.grade !== "");
  if (completed.length === 0) return 0;

  const totalPoints = completed.reduce((s, a) => s + parseFloat(a.grade || 0), 0);
  const totalMax = completed.reduce((s, a) => s + parseFloat(a.maxPoints || 0), 0);
  return totalMax > 0 ? (totalPoints / totalMax) * 100 : 0;
};

export const calculateOverallGrade = (classData) => {
  let totalWeighted = 0;
  let totalWeight = 0;
  let extraCreditPoints = 0;

  Object.values(classData.categories).forEach(cat => {
    if (cat.weight === null) {
      const completed = cat.assignments.filter(a => a.grade !== null && a.grade !== "");
      extraCreditPoints += completed.reduce((s, a) => s + parseFloat(a.grade || 0), 0);
    } else {
      const avg = calculateCategoryAverage(cat.assignments);
      if (avg > 0 || cat.assignments.some(a => a.grade !== null && a.grade !== "")) {
        totalWeighted += (avg / 100) * cat.weight;
        totalWeight += cat.weight;
      }
    }
  });

  if (classData.gradeType === "percent") {
    const base = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
    return base + extraCreditPoints;
  }
  return totalWeighted + extraCreditPoints;
};

export const calculateRequiredGrade = (currentClass, categoryName, targetOverall) => {
  const category = currentClass.categories[categoryName];
  if (category.weight === null) return "N/A for extra credit";

  const otherWeighted = Object.entries(currentClass.categories)
    .filter(([name]) => name !== categoryName)
    .reduce((sum, [, cat]) => {
      if (cat.weight === null) return sum;
      return sum + (calculateCategoryAverage(cat.assignments) / 100) * cat.weight;
    }, 0);

  const totalOtherWeight = Object.values(currentClass.categories)
    .filter(cat => cat.weight !== null && cat !== category)
    .reduce((s, cat) => s + cat.weight, 0);

  const requiredWeighted = (targetOverall / 100) * (totalOtherWeight + category.weight) - otherWeighted;
  const requiredGrade = (requiredWeighted / category.weight) * 100;
  return Math.max(0, requiredGrade).toFixed(1);
};

export const calculateNextAssignmentGrade = (currentClass, categoryName, targetOverall, assignmentPoints) => {
  const category = currentClass.categories[categoryName];
  if (category.weight === null) return "N/A for extra credit";

  const otherWeighted = Object.entries(currentClass.categories)
    .filter(([name]) => name !== categoryName)
    .reduce((sum, [, cat]) => {
      if (cat.weight === null) return sum;
      return sum + (calculateCategoryAverage(cat.assignments) / 100) * cat.weight;
    }, 0);

  const totalOtherWeight = Object.values(currentClass.categories)
    .filter(cat => cat.weight !== null && cat !== category)
    .reduce((s, cat) => s + cat.weight, 0);

  const requiredWeighted = (targetOverall / 100) * (totalOtherWeight + category.weight) - otherWeighted;
  const requiredCategoryAvg = (requiredWeighted / category.weight) * 100;

  const currentTotalGradePts = category.assignments.reduce((s, a) => s + parseFloat(a.grade || 0), 0);
  const currentTotalMax = category.assignments.reduce((s, a) => s + parseFloat(a.maxPoints || 0), 0);
  const newTotalMax = currentTotalMax + parseFloat(assignmentPoints || 0);

  const requiredTotalGradePts = (requiredCategoryAvg / 100) * newTotalMax;
  const need = requiredTotalGradePts - currentTotalGradePts;

  return Math.max(0, need).toFixed(1);
};

// display helpers
export const getWeightDisplay = (weight, gradeType) => {
  if (weight === null) return "Extra Credit";
  return gradeType === "points" ? `${weight} pts` : `${weight}%`;
};

export const getCurrentTotalWeight = (currentClass) => {
  if (!currentClass) return 0;
  return Object.values(currentClass.categories)
    .filter(c => c.weight !== null)
    .reduce((s, c) => s + c.weight, 0);
};
