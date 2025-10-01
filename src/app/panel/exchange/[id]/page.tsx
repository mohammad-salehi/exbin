"use client";

import React, { useEffect, useState } from "react";
import CeoDetail from "../../../../../components/Dashboard/Exchange_page/CeoDetail/CeoDetail";
import BoardMemberTable from "../../../../../components/Dashboard/Exchange_page/BoardMemberInfo/BoardMemberInfo";
import ExchangeAgentInfo from "../../../../../components/Dashboard/Exchange_page/ExchangeAgentInfo/ExchangeAgentInfo";
import EmployeeInfo from "../../../../../components/Dashboard/Exchange_page/EmployeeInfo/EmployeeInfo";
import Exchange_info from "../../../../../components/Dashboard/Exchange_page/Exchange_info/Exchange_info";
import AnimatedText from "../../../../../components/AnimatedLoading/AnimatedLoading";

const Page = () => {
  const [C1, SetC1] = useState<boolean>(false);
  const [C2, SetC2] = useState<boolean>(false);
  const [C3, SetC3] = useState<boolean>(false);
  const [C4, SetC4] = useState<boolean>(false);
  const [C5, SetC5] = useState<boolean>(false);
  const [Loading, SetLoading] = useState<boolean>(true);

  useEffect(() => {
    if (C1 && C2 && C3 && C4 && C5) {
      SetLoading(false);
    }
  }, [C1, C2, C3, C4, C5]);

  // اختیاری: برای اینکه اگر یکی از بخش‌ها fail شد گیر نکنه
  useEffect(() => {
    const fallback = setTimeout(() => SetLoading(false), 15000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <div className="relative px-4 xl:px-0 mb-4">
      {Loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 dark:bg-bgColor-dark/70 backdrop-blur-sm">
          <div className="pointer-events-none">
            <AnimatedText />
          </div>
        </div>
      )}

      <Exchange_info SetC1={SetC1} />
      <CeoDetail SetC2={SetC2} />
      <BoardMemberTable SetC3={SetC3} />
      <ExchangeAgentInfo SetC4={SetC4} />
      <EmployeeInfo SetC5={SetC5} />
    </div>
  );
};

export default Page;
