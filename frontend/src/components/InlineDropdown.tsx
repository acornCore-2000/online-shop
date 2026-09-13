import { useEffect, useRef, useState } from "react";
import styles from "./InlineDropdown.module.css";

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type InlineDropdownProps<T extends string> = {
  id: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
};

export default function InlineDropdown<T extends string>({
  id,
  value,
  options,
  onChange,
  label,
}: InlineDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption?.label}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`} aria-hidden="true">
          ^
        </span>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox" aria-labelledby={id}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${option.value === value ? styles.selected : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
