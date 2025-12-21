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
              "w-full py-1.5 text-sm rounded-md transition-colors " +
              (isActive
                ? "bg-[#63C3FF] text-[#0F172A] border border-boxBorderColor dark:border-boxBorderColor-dark"
                : "bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark")
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
