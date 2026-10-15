import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../hooks/useAuth";
import { useFeedback } from "../hooks/useFeedback";

const Login = () => {
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.email.trim() || !form.password) {
        throw new Error("Vui lòng nhập email và mật khẩu");
      }

      if (!emailRegex.test(form.email.trim())) {
        throw new Error("Email không đúng định dạng");
      }

      if (form.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      if (form.password.length > 72) {
        throw new Error("Mật khẩu không được vượt quá 72 ký tự");
      }

      await signIn({ email: form.email.trim(), password: form.password });
      toast.success("Đăng nhập thành công", "Chào mừng bạn quay lại.");
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Đăng nhập thất bại", submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Mở không gian quản lý tài liệu API của bạn.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>
        <PasswordInput
          id="login-password"
          label="Mật khẩu"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          autoComplete="current-password"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          <LogIn size={17} />
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-bold text-accent">
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
