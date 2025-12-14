'use client'

import React from "react";

type StatItem = {
  label: string;
  value: number;
};

type StatsGridProps = {
  data: StatItem[];
};

const StatsGrid: React.FC<StatsGridProps> = ({ data }) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 24px",
    direction: "rtl",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    alignItems: "stretch",
  };

  const cardStyle: React.CSSProperties = {
    minHeight: "70px",
    padding: "10px 18px",
    borderRadius: "999px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "4px",
    lineHeight: 1.2,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    opacity: 0.75,
    lineHeight: 1.4,
  };

  return (
    <div
      style={containerStyle}
      className="bg-boxColor dark:bg-boxColor-dark rounded-xl main-animated-border-box2"
    >
      <div style={gridStyle}>
        {(data ?? []).map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            style={cardStyle}
            className="bg-bgColor dark:bg-bgColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark text-titleText dark:text-titleText-dark"
          >
            <div style={labelStyle}>{item.label}</div>
            <div style={valueStyle}>{Number(item.value).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;
