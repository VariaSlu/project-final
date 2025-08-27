// --- Simple growth model for 0–5y ---
// 1) Estimate height from age (months) using WHO-ish median checkpoints + linear interpolation
// 2) Map height -> EU clothing size (nearest standard step)
// 3) If a measured height exists now, calibrate the whole curve by that delta

export const monthsSince = (dateStr) => {
  const d = new Date(dateStr);
  return Math.max(
    0,
    Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  );
};

// Median checkpoints (unisex-ish) for height in cm
const PTS = [
  { m: 0, h: 50 }, { m: 3, h: 61 }, { m: 6, h: 67 }, { m: 9, h: 72 },
  { m: 12, h: 76 }, { m: 18, h: 82 }, { m: 24, h: 88 }, { m: 36, h: 96 },
  { m: 48, h: 103 }, { m: 60, h: 110 }
];

export const heightAtMonths = (m) => {
  if (m <= PTS[0].m) return PTS[0].h;
  if (m >= PTS[PTS.length - 1].m) return PTS[PTS.length - 1].h;
  for (let i = 0; i < PTS.length - 1; i++) {
    const a = PTS[i], b = PTS[i + 1];
    if (m >= a.m && m <= b.m) {
      const t = (m - a.m) / (b.m - a.m);
      return a.h + t * (b.h - a.h);
    }
  }
  return 104;
};

export const heightToSize = (h) => {
  if (!h) return null;
  const steps = [50, 56, 62, 68, 74, 80, 86, 92, 98, 104, 110, 116, 122, 128, 134, 140, 146, 152, 158];
  let best = steps[0];
  for (const s of steps) if (Math.abs(s - h) < Math.abs(best - h)) best = s;
  return best;
};

// Build next-12-months series; if currentHeight is provided, calibrate curve by its delta.
export const predictionSeries = ({ birthdate, currentHeight }) => {
  const start = new Date();
  const nowM = monthsSince(birthdate);
  const estNow = heightAtMonths(nowM);
  const delta = (typeof currentHeight === "number" && currentHeight > 0) ? (currentHeight - estNow) : 0;

  const data = [];
  for (let m = 0; m <= 12; m++) {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const ageM = nowM + m;
    const h = heightAtMonths(ageM) + delta;
    const size = heightToSize(h);
    data.push({
      label: d.toLocaleString("default", { month: "short" }),
      size,
      height: Math.round(h)
    });
  }
  return data;
};