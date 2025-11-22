"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectBoxProps {
  label?: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string; // <- nowy props
}

export default function SelectBox({
  label,
  options,
  defaultValue,
  onChange,
  className = "w-full",
}: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(
    defaultValue || options[0]?.value
  );
  const boxRef = useRef<HTMLDivElement>(null);

  // zamykanie po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    onChange?.(value);
  };

  return (
    <div className={className} ref={boxRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-left text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
        >
          <span>
            {options.find((opt) => opt.value === selected)?.label || "Select..."}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <ul className="absolute right-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-white/10 bg-[#141322] py-1 text-sm shadow-lg z-50">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`cursor-pointer select-none px-3 py-2 hover:bg-[#1f1d36] ${
                  selected === opt.value
                    ? "bg-[#1f1d36] font-semibold text-violet-400"
                    : "text-gray-200"
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
