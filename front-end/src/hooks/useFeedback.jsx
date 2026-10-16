import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AccessibleModal from "../components/AccessibleModal";

const FeedbackContext = createContext(null);

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const iconStyles = {
  success: "text-emerald-600",
  error: "text-rose-600",
  info: "text-sky-600",
  warning: "text-amber-600",
};

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "info", title, message }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, title, message }]);
      window.setTimeout(() => removeToast(id), 3200);
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (title, message) => pushToast({ type: "success", title, message }),
      error: (title, message) => pushToast({ type: "error", title, message }),
      info: (title, message) => pushToast({ type: "info", title, message }),
      warning: (title, message) => pushToast({ type: "warning", title, message }),
    }),
    [pushToast]
  );

  useEffect(() => {
    const handleUnauthorized = (event) => {
      pushToast({
        type: "warning",
        title: "Phiên đăng nhập đã kết thúc",
        message: event.detail?.message || "Vui lòng đăng nhập lại để tiếp tục.",
      });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [pushToast]);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || "Xác nhận thao tác",
        message: options.message || "Bạn có chắc muốn tiếp tục?",
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy",
        variant: options.variant || "danger",
        resolve,
      });
    });
  }, []);

  const closeConfirm = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[120] flex w-[min(420px,calc(100vw-32px))] flex-col gap-3">
        {toasts.map((item) => {
          const Icon = toastIcons[item.type] || Info;

          return (
            <div key={item.id} className={`rounded-md border px-4 py-3 shadow-soft ${toastStyles[item.type] || toastStyles.info}`}>
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 shrink-0 ${iconStyles[item.type] || iconStyles.info}`} size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  {item.message ? <p className="mt-1 text-sm leading-5 opacity-80">{item.message}</p> : null}
                </div>
                <button type="button" className="rounded p-1 opacity-70 hover:bg-white/60 hover:opacity-100" onClick={() => removeToast(item.id)} aria-label="Đóng thông báo" title="Đóng thông báo">
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmState ? (
        <AccessibleModal titleId="confirm-dialog-title" onClose={() => closeConfirm(false)} panelClassName="max-w-md">
            <div className="border-b border-line px-5 py-4">
              <h2 id="confirm-dialog-title" className="text-lg font-black text-ink">{confirmState.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{confirmState.message}</p>
            </div>
            <div className="flex justify-end gap-3 bg-panel px-5 py-4">
              <button type="button" className="btn btn-muted" onClick={() => closeConfirm(false)}>
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={confirmState.variant === "danger" ? "btn btn-danger" : "btn btn-primary"}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmText}
              </button>
            </div>
        </AccessibleModal>
      ) : null}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
