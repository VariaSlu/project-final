import { useForm } from "react-hook-form";
import { useAuth } from "../store/auth";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { register, handleSubmit } = useForm();
  const setToken = useAuth((s) => s.setToken);
  const nav = useNavigate();

  const onSubmit = async (data) => {
    const res = await api("/auth/register", { method: "POST", body: JSON.stringify(data) });
    setToken(res.token);
    nav("/");
  };

  return (
    <main className="p-4 max-w-sm mx-auto">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input {...register("email", { required: true })} type="email" />
        <label>Password</label>
        <input {...register("password", { required: true, minLength: 6 })} type="password" />
        <button type="submit">Sign up</button>
      </form>
      <p className="mt-2">Already have an account? <Link to="/login">Login</Link></p>
    </main>
  );
};

export default Register;
