'use client';

import React, { useEffect, useMemo, useState } from "react";

export default function AnimatedParagraph() {
  const text = "CED Portal"; // همون متن پاراگراف
  const chars = useMemo(() => Array.from(text), [text]);

  // فقط ایندکس‌هایی که space نیستن
  const animatableIndexes = useMemo(
    () => chars.map((c, i) => (c === " " ? null : i)).filter((x): x is number => x !== null),
    [chars]
  );

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!animatableIndexes.length) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % animatableIndexes.length);
    }, 300);
    return () => clearInterval(interval);
  }, [animatableIndexes.length]);

  const activeIndex = animatableIndexes[step] ?? -1;

  return (
    <p className="text-3xl font-bold mr-4 text-titleText dark:text-titleText-dark text-center w-full">
      {chars.map((ch, i) => {
        // فاصله‌ها ثابت می‌مونن و اصلاً هایلایت نمی‌شن
        if (ch === " ") return <span key={i}>&nbsp;</span>;

        const isActive = i === activeIndex;

        return (
          <span
            key={i}
            className={`transition-all duration-500 ease-in-out ${
              isActive ? "opacity-100 text-[deepskyblue]" : "opacity-80 text-titleText dark:text-titleText-dark"
            }`}
          >
            {ch}
          </span>
        );
      })}
    </p>
  );
}
