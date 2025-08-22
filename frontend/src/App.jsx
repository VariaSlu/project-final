import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Kids from "./pages/Kids";

const Protected = ({ children }) => {
  const token = useAuth((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/kids" element={<Protected><Kids/></Protected>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
