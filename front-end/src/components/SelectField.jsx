import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

const SelectField = ({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  const updateMenuPosition = () => {
    if (!rootRef.current) {
      return;
    }

    const rect = rootRef.current.getBoundingClientRect();
    const viewportGap = 12;
    const availableBelow = window.innerHeight - rect.bottom - viewportGap;
    const availableAbove = rect.top - viewportGap;
    const maxHeight = Math.min(256, Math.max(160, Math.max(availableBelow, availableAbove)));
    const shouldOpenAbove = availableBelow < 180 && availableAbove > availableBelow;

    setMenuStyle({
      position: "fixed",
      left: `${rect.left}px`,
      top: shouldOpenAbove ? "auto" : `${rect.bottom + 6}px`,
      bottom: shouldOpenAbove ? `${window.innerHeight - rect.top + 6}px` : "auto",
      width: `${rect.width}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 120,
    });
  };

  useLayoutEffect(() => {
    if (open) {
      updateMenuPosition();
    }
  }, [open, value, options.length]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideButton = rootRef.current?.contains(event.target);
      const clickedInsideMenu = menuRef.current?.contains(event.target);

      if (!clickedInsideButton && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleViewportChange = () => {
      if (open) {
        updateMenuPosition();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const chooseOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className={`input flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${buttonClassName}`}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
      >
        <span className={`min-w-0 truncate ${selectedOption ? "text-ink" : "text-slate-400"}`}>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open
        ? createPortal(
        <div
          ref={menuRef}
          className={`overflow-auto rounded-md border border-line bg-white p-1 shadow-xl ${menuClassName}`}
          style={menuStyle}
          role="listbox"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                type="button"
                key={option.value || "__empty"}
                className={`flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm transition ${
                  selected ? "bg-teal-50 font-semibold text-accent" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => chooseOption(option.value)}
                role="option"
                aria-selected={selected}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected ? <Check size={16} className="shrink-0" /> : null}
              </button>
            );
          })}
        </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default SelectField;
