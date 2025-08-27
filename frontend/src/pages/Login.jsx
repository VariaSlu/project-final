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
    // ...
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
        <div>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" {...register("email", { required: true })} type="email" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="login-password">Password</label>
          <input id="login-password" {...register("password", { required: true, minLength: 6 })} type="password" autoComplete="current-password" />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
};

export default Login;
