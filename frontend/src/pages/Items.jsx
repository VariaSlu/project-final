import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const Items = () => {
  const [kids, setKids] = useState([]);
  const [items, setItems] = useState([]);
  const [childId, setChildId] = useState(localStorage.getItem("kidId") || "");
  const [filterStatus, setFilterStatus] = useState("needed");
  const [form, setForm] = useState({ type: "jacket", size: "", season: "winter", status: "needed", notes: "" });

  useEffect(() => { api("/kids").then(setKids); }, []);
  useEffect(() => { api("/items").then(setItems); }, []);
  useEffect(() => { localStorage.setItem("kidId", childId); }, [childId]);

  const filtered = useMemo(() =>
    items.filter(i => (!childId || i.childId === childId) && (!filterStatus || i.status === filterStatus)),
    [items, childId, filterStatus]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!childId) return;
    const body = { ...form, childId };
    const newItem = await api("/items", { method: "POST", body: JSON.stringify(body) });
    setItems(prev => [...prev, newItem]);
    setForm({ type: "jacket", size: "", season: "winter", status: "needed", notes: "" });
  };

  const removeItem = async (id) => {
    await api(`/items/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i._id !== id));
  };

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Items</h1>

      <section>
        <label>Kid</label>
        <select value={childId} onChange={(e) => setChildId(e.target.value)}>
          <option value="">All</option>
          {kids.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
        </select>

        <label>Status</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          <option value="needed">Needed</option>
          <option value="current">Current</option>
          <option value="stored">Stored</option>
          <option value="to-sell">To sell</option>
        </select>
      </section>

      <ul>
        {filtered.map(i => (
          <li key={i._id}>
            {i.type} • size {i.size} • {i.season} • {i.status}
            <button onClick={() => removeItem(i._id)} style={{ marginLeft: 8 }}>✕</button>
          </li>
        ))}
        {!filtered.length && <li>No items</li>}
      </ul>

      <form onSubmit={addItem}>
        <h2>Add item</h2>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option>jacket</option><option>pants</option><option>boots</option>
          <option>hat</option><option>top</option><option>gloves</option><option>other</option>
        </select>
        <input placeholder="size" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} required />
        <select value={form.season} onChange={e => setForm({ ...form, season: e.target.value })}>
          <option>winter</option><option>spring</option><option>summer</option><option>autumn</option><option>all</option>
        </select>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>needed</option><option>current</option><option>stored</option><option>to-sell</option>
        </select>
        <input placeholder="notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" disabled={!childId}>Add (select kid)</button>
      </form>
    </main>
  );
};

export default Items;
