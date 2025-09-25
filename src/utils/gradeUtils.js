
export const calculateCategoryAverage = (assignments) => {
  const completed = assignments.filter(a => a.grade !== null && a.grade !== '');
  if (completed.length === 0) return 0;
  
  const totalPoints = completed.reduce((sum, a) => sum + parseFloat(a.grade || 0), 0);
  const totalMaxPoints = completed.reduce((sum, a) => sum + parseFloat(a.maxPoints || 0), 0);
  
  return totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;
};

export const calculateOverallGrade = (classData) => {
  let totalWeightedPoints = 0;
  let totalWeight = 0;
  let extraCreditPoints = 0;

  Object.values(classData.categories).forEach(category => {
    if (category.weight === null) {
      const completed = category.assignments.filter(a => a.grade !== null && a.grade !== '');
      extraCreditPoints += completed.reduce((sum, a) => sum + parseFloat(a.grade || 0), 0);
    } else {
      const average = calculateCategoryAverage(category.assignments);
      if (average > 0 || category.assignments.some(a => a.grade !== null && a.grade !== '')) {
        totalWeightedPoints += (average / 100) * category.weight;
        totalWeight += category.weight;
      }
    }
  });

  if (classData.gradeType === 'percent') {
    const baseScore = totalWeight > 0 ? (totalWeightedPoints / totalWeight) * 100 : 0;
    return baseScore + extraCreditPoints;
  } else {
    return totalWeightedPoints + extraCreditPoints;
  }
};

export const calculateRequiredGrade = (classes, activeClass, categoryName, targetOverall) => {
  const currentClass = classes[activeClass];
  const category = currentClass.categories[categoryName];
  
  if (category.weight === null) return "N/A for extra credit";
  
  const otherCategoriesWeightedScore = Object.entries(currentClass.categories)
    .filter(([name, _]) => name !== categoryName)
    .reduce((sum, [_, cat]) => {
      if (cat.weight === null) return sum;
      return sum + (calculateCategoryAverage(cat.assignments) / 100) * cat.weight;
    }, 0);
  
  const totalOtherWeight = Object.values(currentClass.categories)
    .filter(cat => cat.weight !== null && cat !== category)
    .reduce((sum, cat) => sum + cat.weight, 0);
  
  const requiredWeightedScore = (targetOverall / 100) * (totalOtherWeight + category.weight) - otherCategoriesWeightedScore;
  const requiredGrade = (requiredWeightedScore / category.weight) * 100;
  
  return Math.max(0, requiredGrade).toFixed(1);
};

export const calculateNextAssignmentGrade = (classes, activeClass, categoryName, targetOverall, assignmentPoints) => {
  const currentClass = classes[activeClass];
  const category = currentClass.categories[categoryName];
  
  if (category.weight === null) return "N/A for extra credit";
  
  const currentTotalPoints = category.assignments.reduce((sum, a) => sum + parseFloat(a.maxPoints || 0), 0);
  const newTotalPoints = currentTotalPoints + parseFloat(assignmentPoints);
  
  const otherCategoriesWeightedScore = Object.entries(currentClass.categories)
    .filter(([name, _]) => name !== categoryName)
    .reduce((sum, [_, cat]) => {
      if (cat.weight === null) return sum;
      return sum + (calculateCategoryAverage(cat.assignments) / 100) * cat.weight;
    }, 0);
  
  const totalOtherWeight = Object.values(currentClass.categories)
    .filter(cat => cat.weight !== null && cat !== category)
    .reduce((sum, cat) => sum + cat.weight, 0);
  
  const requiredWeightedScore = (targetOverall / 100) * (totalOtherWeight + category.weight) - otherCategoriesWeightedScore;
  const requiredCategoryAverage = (requiredWeightedScore / category.weight) * 100;
  
  const currentTotalGradePoints = category.assignments.reduce((sum, a) => sum + parseFloat(a.grade || 0), 0);
  const requiredTotalGradePoints = (requiredCategoryAverage / 100) * newTotalPoints;
  const requiredNewAssignmentGrade = requiredTotalGradePoints - currentTotalGradePoints;
  
  return Math.max(0, requiredNewAssignmentGrade).toFixed(1);
};

export const getCurrentTotalWeight = (currentClass) => {
  if (!currentClass) return 0;
  return Object.values(currentClass.categories)
    .filter(cat => cat.weight !== null)
    .reduce((sum, cat) => sum + cat.weight, 0);
};

export const getWeightDisplay = (weight, gradeType) => {
  if (weight === null) return 'Extra Credit';
  if (gradeType === 'points') return `${weight} pts`;
  return `${weight}%`;
};