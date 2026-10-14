import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { useFeedback } from "../hooks/useFeedback";

const Register = () => {
  const { signUp, isAuthenticated } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        throw new Error("Vui lòng nhập đầy đủ tên, email và mật khẩu");
      }

      if (form.name.trim().length < 2) {
        throw new Error("Tên phải có ít nhất 2 ký tự");
      }

      if (!emailRegex.test(form.email.trim())) {
        throw new Error("Email không đúng định dạng");
      }

      if (form.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      await signUp(form);
      toast.success("Đăng ký thành công", "Tài khoản đã được tạo.");
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Đăng ký thất bại", submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Bắt đầu tạo project và tài liệu API.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <div>
          <label className="label">Tên</label>
          <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={80} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </div>
        <div>
          <label className="label">Mật khẩu</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={6}
            required
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
