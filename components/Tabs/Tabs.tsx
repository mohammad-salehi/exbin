'use client';

import React, { useState } from 'react';

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

type Props = {
  items: TabItem[];
  defaultId?: string;
};

export const PantaTabs: React.FC<Props> = ({ items, defaultId }) => {
  const [activeId, setActiveId] = useState<string>(defaultId ?? items[0]?.id);

  return (
    <div className="w-full">
      {/* تب‌ها */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex min-w-max items-center gap-2 bg-gohan border-b-2 border-boxBorderColor dark:border-boxBorderColor-dark">
          {items.map((tab) => {
            const isActive = tab.id === activeId;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={[
                  'relative inline-flex items-center gap-2 px-4 py-2 transition-all duration-150',
                  'shrink-0 whitespace-nowrap', // مهم برای موبایل
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-piccolo focus-visible:ring-offset-2 focus-visible:ring-offset-gohan',
                  isActive
                    ? 'text-primary'
                    : 'bg-transparent hover:bg-beerus/60 text-titleText dark:text-titleText-dark'
                ].join(' ')}
              >
                {/* خط زیر تب فعال که میاد روی border اصلی و اونو می‌پوشونه */}
                {isActive && (
                  <span
                    className="pointer-events-none absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary"
                  />
                )}

                {tab.icon && (
                  <span className="transition-colors w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    {tab.icon}
                  </span>
                )}

                {/* تایتل تب */}
                <span className="textTitle text-moon-16 md:text-moon-18 transition-colors">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* محتوای تب فعال */}
      <div className="mt-4 bg-goku p-4 text-bulma">
        {items.find((t) => t.id === activeId)?.content}
      </div>
    </div>
  );
};
