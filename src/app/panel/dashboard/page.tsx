
"use client";

import { useState } from "react";
import CircularChart from "../../../../components/Dashboard/CircularChart/CircularChart";

export default function page() {
  const [ChartData, SetChartData] = useState([
    { name: "ثبت شده", value: 60 },
    { name: "ثبت نشده", value: 40, color: "#E4E4E4" },
    { name: "2ثبت نشده", value: 40, color: "#E4E4E4" },
  ]);

  return (
    <div>
      <CircularChart data={ChartData}
        title="صرافی های ثبت شده"
      />
    </div>
  );
}
