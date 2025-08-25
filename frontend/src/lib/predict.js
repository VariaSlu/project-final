// naive demo: if age < 3 → +1 size every 8 months; else +1 every 12 months
export const predictSizes = ({ currentSize, birthdate }) => {
  const start = new Date();
  const points = [];
  let size = parseInt(String(currentSize), 10) || 100;

  for (let m = 0; m <= 12; m++) {
    const date = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const ageYears = (date - new Date(birthdate)) / (365.25 * 24 * 60 * 60 * 1000);
    const bumpEvery = ageYears < 3 ? 8 : 12;
    if (m !== 0 && m % bumpEvery === 0) size += 1;

    points.push({
      label: date.toLocaleString("default", { month: "short" }),
      size
    });
  }
  return points;
};
