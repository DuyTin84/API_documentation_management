import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(form);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Bắt đầu tạo project và tài liệu API.">
      <form className="space-y-4" onSubmit={submit}>
        {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <div>
          <label className="label">Tên</label>
          <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>
        <div>
          <label className="label">Mật khẩu</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          <UserPlus size={17} />
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-bold text-accent">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
