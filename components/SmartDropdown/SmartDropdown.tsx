"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type Option = {
  label: string;
  value: string;
};

interface SmartDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function SmartDropdown({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید...",
  className = ""
}: SmartDropdownProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // موقعیت را نسبت به صفحه محاسبه کن
  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    });
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // بستن با کلیک بیرون
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      if (!(e.target instanceof Node)) return;

      if (!buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`
          w-full px-4 py-2 rounded-xl border 
          bg-white dark:bg-gray-900
          text-gray-800 dark:text-gray-200
          flex justify-between items-center
          shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800
          transition cursor-pointer
          ${className}
        `}
      >
        <span>{value ? options.find(o => o.value === value)?.label : placeholder}</span>
        <span>▾</span>
      </button>

      {/* Portal dropdown */}
      {open &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 999999
            }}
            className="rounded-xl border bg-white dark:bg-gray-900 shadow-xl overflow-hidden animate-fadeScale"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  px-4 py-2 cursor-pointer text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${opt.value === value ? "bg-gray-100 dark:bg-gray-700 font-bold" : ""}
                `}
              >
                {opt.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
