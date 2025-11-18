// components/RiskSwitch.tsx
import React from "react";

type Option = {
  label: string;
  value: string;
};

interface RiskSwitchProps {
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
}

const defaultOptions: Option[] = [
  { label: "پرریسک", value: "high" },
  { label: "ریسک متوسط", value: "medium" },
  { label: "کم‌ریسک", value: "low" },
  { label: "همه", value: "all" },
];

const RiskSwitch: React.FC<RiskSwitchProps> = ({
  value,
  onChange,
  options = defaultOptions,
}) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1"
      dir="ltr"
    >

      {options.map((opt) => {
        const isActive = opt.value === value;

        return (
          <div className="">
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
          </div>
        );
      })}
    </div>
  );
};

export default RiskSwitch;
