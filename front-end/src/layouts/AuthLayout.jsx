import { BookOpen } from "lucide-react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="grid min-h-screen bg-panel lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r border-line bg-ink p-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent">
            <BookOpen size={20} />
          </span>
          <span className="text-lg font-black">API Doc Manager</span>
        </div>

        <div className="flex flex-1 items-center">
          <div>
            <p className="max-w-md text-4xl font-black leading-tight">
              Quản lý tài liệu API
            </p>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
              Tổ chức endpoint, tham số, request và response trong một không
              gian tập trung, rõ ràng và dễ tra cứu.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-ink">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
