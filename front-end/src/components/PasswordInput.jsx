import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ id, label, value, onChange, autoComplete, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const actionLabel = isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu";
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          className="input pr-12"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          minLength={6}
          maxLength={72}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={actionLabel}
          aria-pressed={isVisible}
          title={actionLabel}
          disabled={disabled}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
