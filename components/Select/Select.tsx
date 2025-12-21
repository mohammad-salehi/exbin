'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@heathmont/moon-base-tw';
import { MenuItem } from '@heathmont/moon-core-tw';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';

type Option = {
  id?: string | number;
  label: string;
  value: string;
};

type Props = {
  label?: string;                 // عنوان بالا (مثلاً "صرافی")
  value: string;                  // مقدار انتخاب‌شده
  onChange: (value: string) => void;

  options: Option[];
  loading?: boolean;

  placeholder?: string;           // وقتی چیزی انتخاب نشده
  allLabel?: string;              // متن گزینه‌ی خالی
  searchable?: boolean;           // سرچ داشته باشه؟
  searchPlaceholder?: string;

  className?: string;             // wrapper
  buttonClassName?: string;       // دکمه
  optionsClassName?: string;      // پنل گزینه‌ها
  direction?: 'rtl' | 'ltr';
};

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  loading = false,
  placeholder = 'انتخاب کنید',
  allLabel = 'همه',
  searchable = true,
  searchPlaceholder = 'جستجو...',
  className = '',
  buttonClassName = '',
  optionsClassName = '',
  direction = 'rtl',
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedLabel = useMemo(() => {
    if (loading) return 'در حال بارگذاری...';
    if (!value) return placeholder;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [loading, placeholder, options, value]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!searchable || !s) return options;
    return options.filter((o) => (o.label ?? '').toLowerCase().includes(s));
  }, [options, q, searchable]);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open]);

  // close on ESC + focus search input when opened
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown, true);

    // فوکوس روی سرچ
    if (searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, searchable]);

  const pick = (val: string) => {
    onChange(val);
    setOpen(false);
    setQ('');
  };

  return (
    <div ref={rootRef} className={`relative w-full ${className}`} dir={direction}>
      {label ? <div className="mb-1 text-sm text-titleText dark:text-titleText-dark">{label}</div> : null}

      <Button
        type="button"
        as="button"
        role="button"
        variant="ghost"
        onClick={() => setOpen((p) => !p)}
        className={
          `flex items-center justify-between w-full pl-10 py-2
           bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
           border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark
           focus:outline-none appearance-none relative outline-none shadow-none ` + buttonClassName
        }
      >
        <span className="truncate">{selectedLabel}</span>
      </Button>

      <ControlsChevronDown className="absolute left-3 top-[38px] text-titleText dark:text-titleText-dark pointer-events-none" />

      {open && (
        <div
          className={
            `absolute left-0 mt-2 w-72 pl-2 pr-2 text-gray-700 bg-white dark:bg-buttonColor-dark
             border border-gray-300 dark:border-buttonBorderColor-dark rounded-lg dark:text-gray-100
             appearance-none z-50 max-h-60 overflow-y-auto ` + optionsClassName
          }
        >
          {searchable && (
            <div className="sticky top-0 z-10 bg-white dark:bg-buttonColor-dark pt-2 pb-2">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                           bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
              />
            </div>
          )}

          {/* گزینه‌ی خالی/همه */}
          <button type="button" className="w-full text-right" onClick={() => pick('')}>
            <MenuItem
              isActive={false}
              isSelected={!value}
              className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${
                !value ? 'bg-gray-100 border-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              <MenuItem.Title>{allLabel}</MenuItem.Title>
            </MenuItem>
          </button>

          {filtered.map((o) => {
            const selected = o.value === value;
            return (
              <button key={o.id ?? o.value} type="button" className="w-full text-right" onClick={() => pick(o.value)}>
                <MenuItem
                  isActive={false}
                  isSelected={selected}
                  className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${
                    selected ? 'bg-gray-100 border-gray-200 dark:bg-gray-700' : ''
                  }`}
                >
                  <MenuItem.Title>{o.label}</MenuItem.Title>
                </MenuItem>
              </button>
            );
          })}

          {!filtered.length && (
            <div className="px-3 py-2 text-xs text-titleText dark:text-titleText-dark opacity-70">موردی پیدا نشد</div>
          )}
        </div>
      )}
    </div>
  );
}
