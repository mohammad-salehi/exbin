import React from "react";

interface PersianYearSelectProps {
  value?: number | null;
  onChange: (year: number | null) => void;
  startYear?: number;
  endYear?: number;
  className?: string;
}

const PersianYearSelect: React.FC<PersianYearSelectProps> = ({
  value,
  onChange,
  startYear = 1380,
  endYear = 1405,
  className = "",
}) => {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value ? Number(e.target.value) : null;
        onChange(val);
      }}
      className={`w-full rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark
                  bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark p-2 ${className}`}
    >
      <option value="">انتخاب سال</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};

export default PersianYearSelect;
