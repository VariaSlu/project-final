import { useAuth } from "../store/auth";

const Dashboard = () => {
  const logout = useAuth((s) => s.logout);

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Dashboard</h1>
      <p>🎉 You are logged in.</p>
      <button onClick={logout}>Logout</button>
    </main>
  );
};

export default Dashboard;
