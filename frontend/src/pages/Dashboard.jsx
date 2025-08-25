import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import useLocalStorage from "../hooks/useLocalStorage";
import { predictSizes } from "../lib/predict";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../store/auth";

const Dashboard = () => {
  const logout = useAuth((s) => s.logout);
  const [kids, setKids] = useState([]);
  const [items, setItems] = useState([]);
  const [kidId, setKidId] = useLocalStorage("kidId", "");

  useEffect(() => { api("/kids").then(setKids).catch(console.error); }, []);
  useEffect(() => { api("/items").then(setItems).catch(console.error); }, []);

  const kid = useMemo(() => {
    if (!kids.length) return null;
    // prefer persisted selection if present
    const k = kids.find((x) => x._id === kidId) || kids[0];
    if (!kidId && k) setKidId(k._id);
    return k;
  }, [kids, kidId, setKidId]);

  // TODO: later store real per-kid current size; for demo use a safe default
  const currentSize = 104;
  const chartData = useMemo(() => (kid ? predictSizes({ currentSize, birthdate: kid.birthdate }) : []), [kid]);

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
                <Line type="monotone" dataKey="size" dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data yet</p>
          )}
        </div>
        <p style={{ fontSize: 12, marginTop: 6 }}>
          Current size assumed {currentSize}. This is a simple demo prediction to meet MVP requirements.
        </p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Upcoming needs</h2>
        <ul>
          {upcoming.length === 0 && <li>No items marked “needed” for {kid?.name || "this kid"}.</li>}
          {upcoming.map((i) => (
            <li key={i._id}>
              {i.type} — size {i.size} — {i.season}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default Dashboard;
