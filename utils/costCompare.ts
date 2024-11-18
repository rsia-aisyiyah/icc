export const getPercentage = (groupingCost: number, realCost: number): number => {
  const p = (realCost / groupingCost) * 100;
  return Math.round(p * 100) / 100;
};

export const getDifference = (groupingCost: number, realCost: number): number => {
  const percentage = getPercentage(groupingCost, realCost);
  return Math.round((100 - percentage) * 100) / 100;
};
