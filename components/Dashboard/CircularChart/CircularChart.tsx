"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";

// تابع برای تولید رنگ‌های تصادفی
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface CircularChartProps {
  data: DonutChartData[];
  title: string;
  InnerSpace?: number;
  Radius?: number;
  paddingAngle?: number;
  height?: number;
  ShowDetails?: boolean;
}

const CircularChart: React.FC<CircularChartProps> = ({
  data,
  title,
  InnerSpace,
  Radius,
  paddingAngle,
  height,
  ShowDetails = true,
}) => {
  const [hoveredData, setHoveredData] = useState<DonutChartData | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [HoveredNumber, SetHoveredNumber] = useState<number>(0);
  const [HoveredText, SetHoveredText] = useState<string>("");

  useEffect(() => {
    const generatedColors = data.map((entry) => entry.color || getRandomColor());
    setColors(generatedColors);
  }, [data]);

  const handleMouseEnter = (item: DonutChartData) => {
    setHoveredData(item);
    SetHoveredNumber(item.value);
    SetHoveredText(item.name);
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    SetHoveredNumber(0);
    SetHoveredText("");
  };

  return (
    <div className="p-4 w-full bg-boxColor text-titleText dark:bg-boxColor-dark dark:text-titleText-dark rounded-xl shadow-lg relative border border-boxBorderColor dark:border-boxBorderColor-dark">
      <h3 className="text-center text-xl mb-2">{title}</h3>
      <div className="px-4 xl:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="border-t xl:border-t-0 xl:border-l border-gray-200 mt-4 xl:mt-0 xl:pl-4">
            <div className="text-center mt-4 text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 xxl:grid-cols-1 gap-4">
                {data.map((entry, index) => (
                  <div
                    className="flex justify-between"
                    key={index}
                    style={{
                      fontWeight: hoveredData?.name === entry.name ? "bold" : "normal",
                    }}
                  >
                    <div className="flex items-center justify-between text-titleText dark:text-titleText-dark">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full ml-2"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="ml-2">{entry.name}</span>
                      </div>
                      <div className="ml-auto"><span className="font-bold">{entry.value}</span> صرافی</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={height !== undefined ? height : 250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={InnerSpace !== undefined ? Number(InnerSpace) : 70}
                  outerRadius={Radius !== undefined ? Number(Radius) : 100}
                  paddingAngle={paddingAngle !== undefined ? Number(paddingAngle) : 1}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index]}
                      onMouseEnter={() => handleMouseEnter(entry)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}

                  <Label
                    value={`${HoveredNumber !== 0 ? HoveredText + ": " + HoveredNumber : ""}`}
                    position="center"
                    style={{ fontSize: "14px", fontWeight: "bold" }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularChart;
