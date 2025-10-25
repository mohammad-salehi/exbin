import React from "react";
import { useEffect, useRef } from "react";

interface LogViewerProps {
  logs: string[]; // آرایه‌ای از رشته‌ها (هر خط یک لاگ)
  maxHeight?: string; // ارتفاع دلخواه (مثل '300px')
  autoScroll?: boolean; // آیا با لاگ جدید به پایین برود؟
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  maxHeight = "400px",
  autoScroll = true,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <div
      className="bg-gray-200 dark:bg-black text-titleText dark:text-titleText-dark font-mono text-sm p-3 rounded-lg shadow-inner overflow-y-auto border border-boxBorderColor dark:border-boxBorderColor-dark"
      style={{ maxHeight }}
    >
      {logs.length === 0 ? (
        <p className="text-gray-500 italic">هیچ لاگی موجود نیست</p>
      ) : (
        logs.map((line, index) => (
          <div
            key={index}
            className="whitespace-pre-wrap border-b border-boxBorderColor dark:border-boxBorderColor-dark pb-1 mb-1 last:border-0 last:pb-0 last:mb-0"
          >
            <span className="text-gray-500 select-none">{index + 1} │ </span>
            <span>{line}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};
