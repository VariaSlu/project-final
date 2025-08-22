import { useState, useEffect } from "react";
import { api } from "../lib/api";

const Kids = () => {
  const [kids, setKids] = useState([]);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => {
    api("/kids").then(setKids).catch(console.error);
  }, []);

  const addKid = async (e) => {
    e.preventDefault();
    const kid = await api("/kids", {
      method: "POST",
      body: JSON.stringify({ name, birthdate })
    });
    setKids([...kids, kid]);
    setName(""); setBirthdate("");
  };

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Kids</h1>
      <form onSubmit={addKid}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={birthdate} onChange={(e) => setBirthdate(e.target.value)} type="date" required />
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
