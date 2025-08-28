import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import useLocalStorage from "../hooks/useLocalStorage";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../store/auth";
import { predictionSeries, heightToSize, monthsSince } from "../lib/growth";

// helpers (top of file)
const seasonOrder = ["winter", "spring", "summer", "autumn", "all"];
const nextSeason = (now = new Date()) => {
  const m = now.getMonth();
  if (m === 11 || m <= 1) return "spring"; // Dec–Feb -> spring next
  if (m >= 2 && m <= 4) return "summer";   // Mar–May -> summer
  if (m >= 5 && m <= 7) return "autumn";   // Jun–Aug -> autumn
  return "winter";                          // Sep–Nov -> winter
};
const needByDate = (season, now = new Date()) => {
  const targetMonth = { winter: 10, spring: 2, summer: 5, autumn: 8 }[season]; // Nov/Mar/Jun/Sep 1st
  if (targetMonth == null) return null;
  const y = now.getMonth() <= targetMonth ? now.getFullYear() : now.getFullYear() + 1;
  return new Date(y, targetMonth, 1);
};

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

  // Needed items list (from real data)
  const buyNext = useMemo(() => {
    if (!kid) return [];
    return items
      .filter(i => i.status === "needed" && i.childId === kid._id)
      .map(i => ({ ...i, needBy: needByDate(i.season) }))
      .sort((a, b) => (a.needBy?.getTime() || Infinity) - (b.needBy?.getTime() || Infinity))
      .slice(0, 5); // keep it short on dashboard
  }, [items, kid]);

  // Super-simple predictions: suggest core pieces for NEXT season, +1 size
  const preds = useMemo(() => {
    if (!kid) return [];
    const ns = nextSeason();
    const sz = (parseInt(baseSize, 10) || 104) + 1; // naive bump for next season
    // pick 2–3 common seasonals; adjust per season if you want
    const core = ns === "winter" ? ["jacket", "boots"] :
      ns === "summer" ? ["hat", "top"] :
        ns === "spring" ? ["jacket", "pants"] : ["jacket", "pants"];
    return core.map(type => ({ type, size: sz, season: ns, needBy: needByDate(ns) }));
  }, [kid, baseSize]);

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

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Buy next</h2>
        <div className="card" aria-live="polite">
          {buyNext.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {buyNext.map(n => (
                <li key={n._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{n.type} · size {n.size} · <b>{n.season}</b></span>
                  <small>{n.needBy ? `need by ${n.needBy.toLocaleDateString()}` : ""}</small>
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = await api(`/items/${n._id}`, { method: "PATCH", body: JSON.stringify({ status: "current" }) });
                      // optimistic update
                      setItems(prev => prev.map(x => x._id === n._id ? updated : x));
                    }}
                    style={{ width: "auto", padding: "6px 10px" }}
                  >
                    Mark bought
                  </button>
                </li>
              ))}
            </ul>
          ) : <p style={{ margin: 0 }}>Nothing urgent 🎉</p>}
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Predicted next season</h2>
        <div className="card">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {preds.map((p, i) => (
              <li key={i}>
                {p.type} · size {p.size} · <b>{p.season}</b> {p.needBy ? `· by ${p.needBy.toLocaleDateString()}` : ""}
              </li>
            ))}
          </ul>
          <small style={{ color: "#555" }}>Tip: predictions are rough; adjust after measuring next month.</small>
        </div>
      </section>

    </main>
  );
};

export default Dashboard;
