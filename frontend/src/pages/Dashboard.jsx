import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import useLocalStorage from "../hooks/useLocalStorage";
import { predictSizes } from "../lib/predict";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../store/auth";
import { predictionSeries, heightToSize, monthsSince } from "../lib/growth";


// WHO-ish median height checkpoints (unisex-ish, good enough for MVP)
const AGE_HEIGHT_POINTS = [
  { m: 0, h: 50 },
  { m: 3, h: 61 },
  { m: 6, h: 67 },
  { m: 9, h: 72 },
  { m: 12, h: 76 },
  { m: 18, h: 82 },
  { m: 24, h: 88 },
  { m: 36, h: 96 },
  { m: 48, h: 103 },
  { m: 60, h: 110 }
];

// linear interpolation between points
const estimateHeightFromAgeMonths = (months) => {
  const pts = AGE_HEIGHT_POINTS;
  if (months <= pts[0].m) return pts[0].h;
  if (months >= pts[pts.length - 1].m) return pts[pts.length - 1].h;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (months >= a.m && months <= b.m) {
      const t = (months - a.m) / (b.m - a.m);
      return a.h + t * (b.h - a.h);
    }
  }
  return 104; // fallback
};


const Dashboard = () => {
  const logout = useAuth((s) => s.logout);
  const [kids, setKids] = useState([]);
  const [items, setItems] = useState([]);
  const [kidId, setKidId] = useLocalStorage("kidId", "");

  useEffect(() => { api("/kids").then(setKids).catch(console.error); }, []);
  useEffect(() => { api("/items").then(setItems).catch(console.error); }, []);

  const kid = useMemo(() => {
    if (!kids.length) return null;
    const k = kids.find((x) => x._id === kidId) || kids[0];
    if (!kidId && k) setKidId(k._id);
    return k;
  }, [kids, kidId, setKidId]);

  // 🔹 use kid.height if available → convert to clothing size; fallback to 104
  const baseSize = useMemo(() => {
    // 1) prefer explicit height
    const fromHeight = heightToSize(kid?.height);
    if (fromHeight) return fromHeight;

    // 2) otherwise estimate from age → height → size
    if (kid?.birthdate) {
      const m = monthsSince(kid.birthdate);
      const estH = estimateHeightFromAgeMonths(m);
      const fromAge = heightToSize(estH);
      if (fromAge) return fromAge;
    }

    // 3) fallback
    return 104;
  }, [kid?.height, kid?.birthdate]);


  const chartData = useMemo(() => {
    if (!kid) return [];
    const currentHeight = kid.height ? Number(kid.height) : undefined;
    return predictionSeries({ birthdate: kid.birthdate, currentHeight });
  }, [kid]);

  // (optional) nicer footnote explaining source of base size:
  const baseNote = kid?.height
    ? `from measured ${kid.height} cm`
    : `estimated from age ${monthsSince(kid?.birthdate)} mo ≈ ${chartData[0]?.height} cm`;

  const upcoming = useMemo(() => {
    if (!kid) return [];
    return items
      .filter((i) => i.status === "needed" && i.childId === kid._id)
      .slice(0, 6);
  }, [items, kid]);

  return (
    <main className="p-4 max-w-sm mx-auto">
      <header style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Kid</label>
        <select
          aria-label="Select kid"
          value={kid?._id || ""}
          onChange={(e) => setKidId(e.target.value)}
          style={{ width: "100%" }}
        >
          {kids.map((k) => (
            <option key={k._id} value={k._id}>{k.name}</option>
          ))}
        </select>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Size prediction (next 12 months)</h2>
        <div style={{ width: "100%", height: 200, border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
          {chartData.length ? (
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="size" dot strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data yet</p>
          )}
        </div>
        <p style={{ fontSize: 12, marginTop: 6 }}>
          Base size: <b>{baseSize}</b>{kid?.height ? ` (from ${kid.height} cm height)` : " (default)"}.
          Prediction uses a simple rule: &lt;3y ≈ +1 size every 8 months, otherwise +1/year.
        </p>
      </section>


    </main>
  );
};

export default Dashboard;
