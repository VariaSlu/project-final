import { useState, useEffect } from "react";
import { api } from "../lib/api";


const Kids = () => {
  const [kids, setKids] = useState([]);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    api("/kids").then(setKids).catch(console.error);
    console.log("VITE_API_URL", import.meta.env.VITE_API_URL);
  }, []);

  const addKid = async (e) => {
    e.preventDefault();
    const kid = await api("/kids", {
      method: "POST",
      body: JSON.stringify({ name, birthdate, height })
    });
    setKids([...kids, kid]);
    setName(""); setBirthdate("");
  };

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Kids</h1>
      <form onSubmit={addKid} aria-label="Add kid form">
        <div>
          <label htmlFor="kid-name">Name</label>
          <input id="kid-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        </div>

        <div className="row">
          <div>
            <label htmlFor="kid-birthdate">Birthdate</label>
            <input id="kid-birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="kid-height">Height (cm)</label>
            <input id="kid-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 98" min="40" max="200" />
          </div>
        </div>

        <button type="submit">Add Kid</button>
      </form>

      <ul>
        {kids.map(k => (
          <li key={k._id}>{k.name} (🎂 {new Date(k.birthdate).toLocaleDateString()})</li>
        ))}
      </ul>
    </main>
  );
};

export default Kids;
