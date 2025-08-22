import { useForm } from "react-hook-form";
import { useAuth } from "../store/auth";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const setToken = useAuth((s) => s.setToken);
  const nav = useNavigate();

  const onSubmit = async (data) => {
    const res = await api("/auth/login", { method: "POST", body: JSON.stringify(data) });
    setToken(res.token);
    nav("/");
  };

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input {...register("email", { required: true })} type="email" />
        <label>Password</label>
        <input {...register("password", { required: true, minLength: 6 })} type="password" />
        <button type="submit">Sign in</button>
      </form>
      <p className="mt-2">No account? <Link to="/register">Register</Link></p>
    </main>
  );
};

export default Login;
