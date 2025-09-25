import { useMemo } from "react";
import {
  calculateCategoryAverage,
  calculateOverallGrade,
  calculateRequiredGrade,
  calculateNextAssignmentGrade,
  getWeightDisplay,
  getCurrentTotalWeight,
} from "../utils/gradeUtils.js";

export default function useGradeCalculations(classes, activeClass) {
  const currentClass = classes[activeClass];

  const overallGrade = useMemo(() => {
    return currentClass ? calculateOverallGrade(currentClass) : 0;
  }, [currentClass]);

  return {
    currentClass,
    overallGrade,
    calculateCategoryAverage,
    calculateRequiredGrade: (categoryName, target) =>
      calculateRequiredGrade(currentClass, categoryName, target),
    calculateNextAssignmentGrade: (categoryName, target, pts) =>
      calculateNextAssignmentGrade(currentClass, categoryName, target, pts),
    getWeightDisplay: (w) => getWeightDisplay(w, currentClass?.gradeType),
    getCurrentTotalWeight: () => getCurrentTotalWeight(currentClass),
  };
}
