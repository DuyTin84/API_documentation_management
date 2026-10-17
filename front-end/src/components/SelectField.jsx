import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState({});
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === value);

  const updateMenuPosition = () => {
    if (!rootRef.current) {
      return;
    }

    const rect = rootRef.current.getBoundingClientRect();
    const viewportGap = 12;
    const availableBelow = window.innerHeight - rect.bottom - viewportGap;
    const availableAbove = rect.top - viewportGap;
    const shouldOpenAbove = availableBelow < 180 && availableAbove > availableBelow;
    const maxHeight = Math.min(256, Math.max(60, shouldOpenAbove ? availableAbove : availableBelow));

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
      menuRef.current?.focus({ preventScroll: true });
    }
  }, [open, value, options.length]);

  useEffect(() => {
    if (open) {
      const menu = menuRef.current;
      const option = menu?.querySelector(`[data-option-index="${activeIndex}"]`);
      if (!option) return;

      const menuBounds = menu.getBoundingClientRect();
      const optionBounds = option.getBoundingClientRect();
      if (optionBounds.top < menuBounds.top) {
        menu.scrollTop -= menuBounds.top - optionBounds.top;
      } else if (optionBounds.bottom > menuBounds.bottom) {
        menu.scrollTop += optionBounds.bottom - menuBounds.bottom;
      }
    }
  }, [open, activeIndex]);

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
        buttonRef.current?.focus({ preventScroll: true });
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
    buttonRef.current?.focus({ preventScroll: true });
  };

  const openMenu = () => {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  const handleMenuKeyDown = (event) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!options.length) return;
      if (event.key === "Home") setActiveIndex(0);
      if (event.key === "End") setActiveIndex(options.length - 1);
      if (event.key === "ArrowDown") setActiveIndex((index) => (index + 1) % options.length);
      if (event.key === "ArrowUp") setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!options.length) return;
      chooseOption(options[activeIndex].value);
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`input flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${buttonClassName}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openMenu();
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
      >
        <span className={`min-w-0 truncate ${selectedOption ? "text-ink" : "text-slate-400"}`}>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open
        ? createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          data-select-menu
          className={`overflow-auto rounded-md border border-line bg-white p-1 shadow-xl ${menuClassName}`}
          style={{ position: "fixed", ...menuStyle }}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel || placeholder}
          aria-activedescendant={options.length ? `${listboxId}-option-${activeIndex}` : undefined}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;

            return (
              <div
                key={option.value || "__empty"}
                id={`${listboxId}-option-${index}`}
                data-option-index={index}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm transition ${
                  active ? "bg-teal-50 font-semibold text-accent" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => chooseOption(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={selected}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected ? <Check size={16} className="shrink-0" /> : null}
              </div>
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
