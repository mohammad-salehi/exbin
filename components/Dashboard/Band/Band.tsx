'use client'

import React from "react";

type StatItem = { label: string; value: number };
type StatsGridProps = { data: StatItem[] };

const StatsGrid: React.FC<StatsGridProps> = ({ data }) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 24px",
    direction: "rtl",
  };

  const singleLineText: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "clip",
    maxWidth: "100%",
  };

  const valueStyle: React.CSSProperties = {
    ...singleLineText,
    fontSize: "16px",
    fontWeight: 200,
    marginBottom: "4px",
    lineHeight: 1.2,
    direction: "rtl",
    textAlign: "right",
  };

  const labelStyle: React.CSSProperties = {
    ...singleLineText,
    fontSize: "12px",
    opacity: 0.75,
    lineHeight: 1.4,
  };

  return (
    <div
      style={containerStyle}
      className="bg-boxColor dark:bg-boxColor-dark rounded-xl main-animated-border-box2 flex flex-col sm:flex-row sm:flex-wrap gap-4"
    >
      {(data ?? []).map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="
            w-full sm:w-fit
            flex flex-col items-start
            dark:border-boxBorderColor-dark
            text-titleText dark:text-titleText-dark
            rounded-full px-4 py-2
          "
        >
          <div style={labelStyle}>{item.label}</div>
          <div style={valueStyle}>{Number(item.value).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
