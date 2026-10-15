import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFeedback } from "../hooks/useFeedback";

const AppLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const { confirm, toast } = useFeedback();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const approved = await confirm({
      title: "Đăng xuất khỏi tài khoản?",
      message: "Bạn sẽ cần đăng nhập lại để tiếp tục quản lý tài liệu API.",
      confirmText: "Đăng xuất",
      cancelText: "Ở lại",
      variant: "primary",
    });

    if (!approved) return;

    signOut();
    toast.success("Đăng xuất thành công", "Phiên làm việc của bạn đã kết thúc.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-panel">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-white">
              <BookOpen size={19} />
            </span>
            <div>
              <p className="text-sm font-black">API Doc Manager</p>
              <p className="text-xs text-slate-500">Công cụ quản lý tài liệu API</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button type="button" className="btn btn-muted h-9 px-3" onClick={handleSignOut} title="Đăng xuất">
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default AppLayout;
