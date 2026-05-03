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
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  loading?: boolean;
  placeholder?: string;
  allLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
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

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown, true);

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
      
      {label && (
        <div className="mb-1 text-sm font-medium text-titleText dark:text-titleText-dark">
          {label}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((p) => !p)}
        className={`
          flex items-center justify-between w-full pl-10 py-2.5
          rounded-xl border
          bg-boxColor dark:bg-boxColor-dark
          border-gray-300 dark:border-buttonBorderColor-dark
          text-titleText dark:text-titleText-dark
          transition-all duration-200
          hover:border-[#63C3FF]
          hover:bg-slate-50 dark:hover:bg-slate-800
          focus:ring-2 focus:ring-[#63C3FF]/40
          ${buttonClassName}
        `}
      >
        <span className="truncate">{selectedLabel}</span>
      </Button>

      <ControlsChevronDown
        className={`
          absolute left-3 top-[38px]
          transition-transform duration-200
          text-titleText dark:text-titleText-dark
          pointer-events-none
          ${open ? 'rotate-180' : ''}
        `}
      />

      {open && (
        <div
          className={`
            absolute left-0 mt-2 w-72
            rounded-xl border
            bg-white dark:bg-buttonColor-dark
            border-gray-200 dark:border-buttonBorderColor-dark
            shadow-lg shadow-black/10
            backdrop-blur-sm
            z-50
            max-h-64 overflow-y-auto
            animate-in fade-in zoom-in-95
            text-titleText dark:text-titleText-dark
            ${optionsClassName}
          `}
        >

          {searchable && (
            <div className="sticky top-0 bg-white dark:bg-buttonColor-dark p-2 border-b border-gray-100 dark:border-buttonBorderColor-dark">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="
                  w-full px-3 py-2
                  text-sm
                  rounded-lg
                  border
                  border-gray-200
                  dark:border-buttonBorderColor-dark
                  bg-boxColor dark:bg-boxColor-dark
                  text-titleText dark:text-titleText-dark
                  outline-none
                  focus:border-[#63C3FF]
                "
              />
            </div>
          )}

          <button type="button" className="w-full text-right px-2 pt-2" onClick={() => pick('')}>
            <MenuItem
              isSelected={!value}
              className={`
                rounded-lg
                transition-colors
                ${!value ? 'bg-[#63C3FF]/15' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              <MenuItem.Title>{allLabel}</MenuItem.Title>
            </MenuItem>
          </button>

          {filtered.map((o) => {
            const selected = o.value === value;

            return (
              <button
                key={o.id ?? o.value}
                type="button"
                className="w-full text-right px-2"
                onClick={() => pick(o.value)}
              >
                <MenuItem
                  isSelected={selected}
                  className={`
                    rounded-lg
                    transition-colors
                    ${selected
                      ? 'bg-[#63C3FF]/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  <MenuItem.Title>{o.label}</MenuItem.Title>
                </MenuItem>
              </button>
            );
          })}

          {!filtered.length && (
            <div className="px-3 py-3 text-xs opacity-70 text-titleText dark:text-titleText-dark">
              موردی پیدا نشد
            </div>
          )}

        </div>
      )}
    </div>
  );
}
