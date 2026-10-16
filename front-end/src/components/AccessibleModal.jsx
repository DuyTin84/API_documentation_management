import { useEffect, useRef } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const AccessibleModal = ({ children, titleId, onClose, panelClassName = "", asForm = false, onSubmit }) => {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const firstInput = panel?.querySelector("input:not([disabled])");
    (asForm ? firstInput : panel?.querySelector(focusableSelector))?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (document.querySelector("[data-select-menu]")) return;
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = [...panel.querySelectorAll(focusableSelector)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first) {
        event.preventDefault();
        panel.focus();
      } else if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [asForm]);

  const Panel = asForm ? "form" : "div";

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <Panel
        ref={panelRef}
        className={`modal-panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onSubmit={onSubmit}
        noValidate={asForm || undefined}
      >
        {children}
      </Panel>
    </div>
  );
};

export default AccessibleModal;
