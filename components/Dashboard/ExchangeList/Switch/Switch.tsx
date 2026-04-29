// components/RiskSwitch.tsx
import React from "react";

type Option = { label: string; value: string };

interface RiskSwitchProps {
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
}

const defaultOptions: Option[] = [
  { label: "همه", value: "all" },
  { label: "کم‌ریسک", value: "low" },
  { label: "ریسک متوسط", value: "medium" },
  { label: "پرریسک", value: "high" },
];

const RiskSwitch: React.FC<RiskSwitchProps> = ({
  value,
  onChange,
  options = defaultOptions,
}) => {
  return (
    <div
      dir="ltr"
      className="
        w-full
        grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
        gap-1
        justify-items-stretch
        items-stretch
      "
    >
      {options.map((opt) => {
        const isActive = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              `
              w-full
              py-2
              px-3
              text-sm font-medium
              rounded-xl
              border
              transition-all
              duration-200
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-offset-2
              focus-visible:ring-[#63C3FF]
              shadow-sm
              ` +
              (isActive
                ? `
                  bg-gradient-to-r from-[#63C3FF] to-[#4BA5FF]
                  text-slate-900
                  border-transparent
                  shadow-md
                `
                : `
                  bg-boxColor dark:bg-boxColor-dark
                  text-titleText dark:text-titleText-dark
                  border-boxBorderColor dark:border-boxBorderColor-dark
                  hover:bg-slate-50/70 dark:hover:bg-slate-700/60
                  hover:border-[#63C3FF]
                `)
            }

          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default RiskSwitch;
