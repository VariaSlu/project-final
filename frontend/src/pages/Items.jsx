// src/pages/Items.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const Items = () => {
  // data
  const [kids, setKids] = useState([]);
  const [items, setItems] = useState([]);

  // filters
  const [childId, setChildId] = useState(localStorage.getItem("kidId") || "");
  const [status, setStatus] = useState("needed");

  // form
  const [form, setForm] = useState({
    type: "jacket",
    size: "",
    season: "winter",
    status: "needed",
    notes: "",
  });

  // load
  useEffect(() => {
    api("/kids").then((ks) => {
      setKids(ks);
      // default kid if none selected yet
      if (!childId && ks.length) {
        setChildId(ks[0]._id);
        localStorage.setItem("kidId", ks[0]._id);
      }
    }).catch(console.error);

    api("/items").then(setItems).catch(console.error);
  }, []); // eslint-disable-line

  // persist selected kid
  useEffect(() => {
    if (childId) localStorage.setItem("kidId", childId);
  }, [childId]);

  const filtered = useMemo(() => {
    return items.filter((i) =>
      (childId ? i.childId === childId : true) &&
      (status ? i.status === status : true)
    );
  }, [items, childId, status]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!childId) return;

    const body = { ...form, childId };
    const created = await api("/items", {
      method: "POST",
      body: JSON.stringify(body),
    });

    setItems((prev) => [...prev, created]);
    setForm({ type: "jacket", size: "", season: "winter", status: "needed", notes: "" });
  };

  const removeItem = async (id) => {
    await api(`/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  return (
    <main>
      <h1>Items</h1>

      {/* Filters */}
      <section className="row" aria-label="Filters">
        <div>
          <label htmlFor="filter-kid">Kid</label>
          <select
            id="filter-kid"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
          >
            <option value="">All</option>
            {kids.map((k) => (
              <option key={k._id} value={k._id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="needed">Needed</option>
            <option value="current">Current</option>
            <option value="stored">Stored</option>
            <option value="to-sell">To sell</option>
          </select>
        </div>
      </section>

      {/* List */}
      <section style={{ marginTop: 12 }}>
        <div className="card" aria-live="polite">
          {filtered.length === 0 ? (
            <p style={{ margin: 0 }}>No items match the current filters.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {filtered.map((i) => (
                <li key={i._id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ flex: 1 }}>
                    {i.type} • size {i.size} • {i.season} • {i.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(i._id)}
                    aria-label={`Delete ${i.type} size ${i.size}`}
                    title="Delete"
                    style={{ width: "auto", padding: "6px 10px", background: "#e11d48" }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Add form */}
      <section style={{ marginTop: 12 }}>
        <form onSubmit={addItem} aria-label="Add item form" className="card">
          <h2 style={{ marginTop: 0 }}>Add item</h2>

          <div className="row">
            <div>
              <label htmlFor="item-type">Type</label>
              <select
                id="item-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>jacket</option>
                <option>pants</option>
                <option>boots</option>
                <option>hat</option>
                <option>top</option>
                <option>gloves</option>
                <option>other</option>
              </select>
            </div>

            <div>
              <label htmlFor="item-size">Size</label>
              <input
                id="item-size"
                placeholder="e.g., 110"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="row">
            <div>
              <label htmlFor="item-season">Season</label>
              <select
                id="item-season"
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
              >
                <option>winter</option>
                <option>spring</option>
                <option>summer</option>
                <option>autumn</option>
                <option>all</option>
              </select>
            </div>

            <div>
              <label htmlFor="item-status">Status</label>
              <select
                id="item-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>needed</option>
                <option>current</option>
                <option>stored</option>
                <option>to-sell</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="item-notes">Notes</label>
            <input
              id="item-notes"
              placeholder="notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" disabled={!childId}>
            Add (select kid)
          </button>
        </form>
      </section>
    </main>
  );
};

export default Items;