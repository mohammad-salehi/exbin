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
  color?: string; // رنگ به صورت اختیاری
}

interface CircularChartProps {
  data: DonutChartData[];
  title: string;
}

const CircularChart: React.FC<CircularChartProps> = ({ data, title }) => {
  const [hoveredData, setHoveredData] = useState<DonutChartData | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [HoveredNumber, SetHoveredNumber] = useState(0);
  const [HoveredText, SetHoveredText] = useState('');

  // تنظیم رنگ‌ها یکبار در ابتدای بارگذاری داده‌ها
  useEffect(() => {
    // بررسی اینکه اگر رنگ در داده‌ها وجود ندارد، رنگ تصادفی اختصاص دهیم
    const generatedColors = data.map((entry) => entry.color || getRandomColor());
    setColors(generatedColors);
  }, [data]); // وابسته به داده‌ها، فقط وقتی داده‌ها تغییر کنند رنگ‌ها تنظیم می‌شوند

  const handleMouseEnter = (data: DonutChartData, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    setHoveredData(data);
    SetHoveredNumber(data.value)
    SetHoveredText(data.name)
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    SetHoveredNumber(0)
    SetHoveredText('')
  };

  return (
    <div className="p-4 w-full bg-white rounded-xl shadow-lg relative">
      <h3 className="text-center text-xl mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index]} // استفاده از رنگ ثابت از state
                onMouseEnter={(e) => handleMouseEnter(entry, e)} // فعال شدن هاور
                onMouseLeave={handleMouseLeave} // غیرفعال شدن هاور
              />
            ))}
            
            <Label
              value={`${HoveredNumber !== 0 ? HoveredText + ': ' + HoveredNumber : ''}`}
              position="center"
              style={{ fontSize: '14px', fontWeight: 'bold' }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center mt-4 text-gray-700">
        {data.map((entry, index) => (
          <div
            className="flex justify-between"
            key={index}
            style={{
              fontWeight: hoveredData?.name === entry.name ? "bold" : "normal", // بولد کردن متن هاور شده
            }}
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full ml-2"
                style={{ backgroundColor: colors[index] }} // رنگ ثابت برای هر بخش
              />
              <span className="ml-2">{entry.name}</span>
            </div>
            <span>{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircularChart;
