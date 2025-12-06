'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type TickerItem = {
  symbol: string;
  price: number;
  change24h: number;
};

type Props = {
  items: TickerItem[];
};

export const CryptoTickerBar: React.FC<Props> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [repeatFactor, setRepeatFactor] = useState(2);

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const update = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const baseWidth = measureRef.current?.scrollWidth || 0;

      if (!containerWidth || !baseWidth) return;

      // چند بار باید لیست تکرار بشه تا یک "چانک" از عرض صفحه بزرگ‌تر بشه؟
      const needed = Math.max(2, Math.ceil(containerWidth / baseWidth) + 1);

      setRepeatFactor((prev) => (prev === needed ? prev : needed));
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(containerRef.current);
    resizeObserver.observe(measureRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items]);

  // یک چانک = items × repeatFactor
  const chunk = useMemo(
    () => Array.from({ length: repeatFactor }, () => items).flat(),
    [items, repeatFactor]
  );

  // برای انیمیشن بی‌نهایت، دو چانک پشت هم
  const animatedItems = useMemo(
    () => [...chunk, ...chunk],
    [chunk]
  );

  if (!items.length) return null;

  return (
    <div className="bg-bgColor dark:bg-bgColor-dark border-b border-boxBorderColor dark:border-boxBorderColor-dark">
      <div
        ref={containerRef}
        className="ticker-container ticker-no-scroll py-2"
      >
        {/* ردیف مخفی فقط برای اندازه‌گیری عرض یک بار لیست */}
        <div
          ref={measureRef}
          className="invisible absolute -z-10 flex"
          dir="ltr"
        >
          {items.map((item, idx) => (
            <TickerChip item={item} key={`measure-${idx}`} />
          ))}
        </div>

        {/* ردیف اصلی متحرک */}
        <div
          className="ticker-content ticker-animate"
          dir="ltr"
        >
          {animatedItems.map((item, idx) => (
            <TickerChip item={item} key={`tick-${idx}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TickerChip: React.FC<{ item: TickerItem }> = ({ item }) => {
  const isUp = item.change24h >= 0;
  const changeSign = isUp ? '+' : '';

  return (
    <div
      className={[
        'mx-2 flex items-center gap-2 px-3 py-1 rounded-full',
        'border border-boxBorderColor dark:border-boxBorderColor-dark',
        'bg-gohan/80 dark:bg-gohan/80',
      ].join(' ')}
    >
      <span className="textTitle text-moon-14">
        {item.symbol}
      </span>

      <span className="text-xs text-mutedText dark:text-mutedText-dark">
        ${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </span>

      <span
        className={[
          'text-xs px-2 py-[2px] rounded-full',
          isUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10',
        ].join(' ')}
      >
        {changeSign}
        {item.change24h.toFixed(2)}%
      </span>
    </div>
  );
};
