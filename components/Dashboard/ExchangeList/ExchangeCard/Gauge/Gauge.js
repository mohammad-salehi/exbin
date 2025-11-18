'use client';

import React, { useMemo } from 'react';

export default function TailwindGaugePretty({
    value = 40,
    size = 180,
    thickness = 20,
    label = 'Performance',
    startAngle = -210,
    endAngle = 110,
    showNeedle = true,
    trackClass = 'text-gray-200 dark:text-gray-700',
} = {}) {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const t = clamped / 100;

    // هندسه
    const sw = (thickness / size) * 40; // strokeWidth برحسب viewBox
    const vbW = 110;
    const cx = 55;
    const cy = 56;
    const rTrack = 40;
    const rValue = rTrack - 0.2;

    // فاصله‌ی امن برای پایین
    const bottomPadding = 16;
    const vbH = Math.ceil(cy + rTrack + bottomPadding);
    const aspect = vbH / vbW;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const polar = (deg, rr = rTrack) => {
        const r = toRad(deg);
        return { x: cx + rr * Math.cos(r), y: cy + rr * Math.sin(r) };
    };
    const describeArc = (a1, a2, rr = rTrack) => {
        const p1 = polar(a1, rr);
        const p2 = polar(a2, rr);
        const largeArc = Math.abs(a2 - a1) > 180 ? 1 : 0;
        const sweep = a2 > a1 ? 1 : 0;
        return `M ${p1.x} ${p1.y} A ${rr} ${rr} 0 ${largeArc} ${sweep} ${p2.x} ${p2.y}`;
    };

    const valueAngle = useMemo(
        () => startAngle + t * (endAngle - startAngle),
        [t, startAngle, endAngle]
    );

    // مسیرها
    const trackPath = useMemo(() => describeArc(startAngle, endAngle, rTrack), [startAngle, endAngle]);
    const valuePath = useMemo(() => describeArc(startAngle, valueAngle, rValue), [startAngle, valueAngle]);

    // نقاط مهم
    const endPoint = polar(valueAngle, rValue);              
    const startPoint = polar(startAngle, rValue);            // شروع آرک رنگی (برای گرادیان درست)
    const farPoint = polar(endAngle, rValue);                // پایان آرک رنگی (برای گرادیان درست)

    // محل «عدد روی نمودار» همیشه بیرون قوس
    const labelOffset = sw / 2 + 4;                          // کمی بیرونِ رینگ
    const labelPoint = polar(valueAngle, rTrack + labelOffset);

    // عقربه
    const needleLen = rTrack - 6;
    const nRad = toRad(valueAngle);
    const nx = cx + needleLen * Math.cos(nRad);
    const ny = cy + needleLen * Math.sin(nRad);

    // برچسب انتهای عقربه را کمی بیرون‌تر از نوک می‌بریم تا روی دایره‌ی آبی/آرک نیفتد
    const tipLabelOffset = 4;
    const tipLabelX = nx + tipLabelOffset * Math.cos(nRad);
    const tipLabelY = ny + tipLabelOffset * Math.sin(nRad);

    const gradId = 'gauge_grad_' + Math.round(size + thickness);

    return (
        <div className="w-full flex items-center justify-center">
            <div
                className="w-full "
                style={{
                    aspectRatio: `${vbW} / ${vbH}`,   // نسبت دقیق
                    maxWidth: size,                   // حداکثر پهنا (می‌تونی حذفش کنی اگه می‌خوای تمام عرض بره)
                }}
            >
                <svg
                    viewBox={`0 0 ${vbW} ${vbH}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                    className="block"
                >
                    {/* بقیه‌ی کدت همینجا می‌مونه: defs, path, mask, foreignObject, ticks, needle, label و غیره */}

                    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full">
                        <defs>
                            {/* 🎯 گرادیان با مختصات حقیقی مسیر (دیگه روی 10% قاطی نمی‌کنه) */}
                            <linearGradient
                                id={gradId}
                                x1={startPoint.x}
                                y1={startPoint.y}
                                x2={farPoint.x}
                                y2={farPoint.y}
                                gradientUnits="userSpaceOnUse"
                            >
                                {/* سبز */}
                                <stop offset="0%" stopColor="rgb(0,255,0)" />
                                {/* آبی */}
                                <stop offset="25%" stopColor="rgb(0,128,255)" />
                                {/* نارنجی */}
                                <stop offset="55%" stopColor="rgb(255,165,0)" />
                                {/* قرمز */}
                                <stop offset="85%" stopColor="rgb(255,0,0)" />
                                {/* کمی فید نرم برای انتها */}
                                <stop offset="100%" stopColor="rgb(200,0,0)" />
                            </linearGradient>

                            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="1" stdDeviation="1.6" floodOpacity="0.25" />
                            </filter>
                        </defs>

                        {/* ✅ خودِ رینگِ خاکستری، مستقل از ماسک */}
                        <path
                            d={trackPath}
                            className={trackClass}     // مثلا: text-gray-200 dark:text-gray-700
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={sw}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* ماسک مسیر کمان */}
                        <mask id="arcMask" maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width={vbW} height={vbH} fill="black" />
                            <path
                                d={trackPath}
                                fill="none"
                                stroke="white"
                                strokeWidth={sw}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </mask>

                        {/* گرادیان زاویه‌ای واقعی روی رینگ (با ماسک) */}
                        <foreignObject
                            x="0" y="0" width={vbW} height={vbH}
                            style={{ pointerEvents: 'none' }}
                            mask="url(#arcMask)"
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: `conic-gradient(
        from ${-startAngle}deg at ${cx / vbW * 100}% ${cy / vbH * 100}%,
        #ff0000 0%,
        #ffa500 60%,
        #0080ff 80%,
        #00ff00 100%
      )`,
                                    filter: 'drop-shadow(0 1px 1.6px rgba(0,0,0,0.25))',
                                }}
                            />
                        </foreignObject>

                        {/* عقربه */}
                        {showNeedle && (
                            <g className="text-rose-500">
                                <line
                                    x1={cx}
                                    y1={cy}
                                    x2={nx}
                                    y2={ny}
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    style={{ transition: 'x2 280ms, y2 280ms' }}
                                />
                                <circle cx={cx} cy={cy} r={7} className="fill-rose-500" opacity="0.08" />
                                <circle cx={cx} cy={cy} r={4.5} fill="white" />
                                <circle cx={cx} cy={cy} r={3.5} className="fill-rose-500" />
                            </g>
                        )}

                        {/* 🔢 عدد روی نمودار: همیشه بیرونِ رینگ */}
                        <g transform={`translate(${labelPoint.x}, ${labelPoint.y})`}>
                            <text
                                textAnchor="middle"
                                className="fill-current text-titleText dark:text-titleText-dark"
                                style={{ fontSize: 9, fontWeight: 600 }}
                                dy="1.5"
                            >
                                {Math.round(clamped)}%
                            </text>
                        </g>
                    </svg>
                </svg>
            </div>
        </div>
    );


}
