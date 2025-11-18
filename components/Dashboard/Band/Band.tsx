"use client";

import React, { useRef, useEffect, useState } from "react";

type Item = {
  title: string;
  value: string | number;
};

export default function PerfectTicker({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // محاسبه عرض کل محتوای اصلی (بدون محتوای تکراری)
      const itemWidth = 170; // min-width آیتم‌ها
      const gap = 12; // gap بین آیتم‌ها
      const totalWidth = (itemWidth + gap) * items.length;
      setContentWidth(totalWidth);
    }
  }, [items]);

  const duplicatedItems = [...items, ...items];

  return (
    <div className="ticker-container" ref={containerRef}>
      <div className="ticker-track">
        {duplicatedItems.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="ticker-title">{item.title}</span>
            <span className="ticker-value">{item.value}</span>
          </div>
        ))}
      </div>

      {/* CSS */}
      <style jsx>{`
        .ticker-container {
          width: 100%;
          overflow: hidden;
          background: #111827;
          padding: 12px 0;
          position: relative;
        }

        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: scroll ${items.length * 3}s linear infinite;
          gap: 12px;
          padding-left: 12px;
        }

        .ticker-item {
          min-width: 170px;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .ticker-title {
          font-size: 11px;
          color: #ccc;
        }

        .ticker-value {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-${contentWidth}px - 12px));
          }
        }
      `}</style>
    </div>
  );
}