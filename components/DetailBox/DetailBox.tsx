import React, { JSX } from "react";
import toast from "react-hot-toast";
interface ColumnData {
    title?: string;
    content: string | JSX.Element;
    image?: string;
}

interface DetailBoxProps {
    data: {
        title: string;
        content: ColumnData[];
    }[];
    downloadLink: string;
}

const DetailBox: React.FC<DetailBoxProps> = ({ data, downloadLink }) => {
    return (
        <div
            className="
                mt-2 pb-2
                rounded-[32px]
                border border-white/30 dark:border-white/10
                bg-gradient-to-br from-white/90 via-white/70 to-white/60
                dark:from-[#0b0f15]/95 dark:via-[#0d131c]/85 dark:to-[#0a0f15]/90
                backdrop-blur-2xl
                shadow-[0_25px_70px_-35px_rgba(0,0,0,0.55)]
                overflow-x-hidden
                transition
                hover:shadow-[0_35px_90px_-40px_rgba(0,0,0,0.6)]
            "
        >
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4">
                {data.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className={`${sectionIndex !== data.length - 1
                            ? "border-l border-white/30 dark:border-white/10"
                            : ""
                            }`}
                    >
                        <h3 className="
                            text-xl font-semibold mb-4
                            rounded-2xl
                            border border-white/40 dark:border-white/10
                            bg-white/70 dark:bg-white/5
                            backdrop-blur-xl
                            text-titleText dark:text-titleText-dark
                            p-2 text-center
                            shadow-[0_10px_28px_-18px_rgba(0,0,0,0.6)]
                        ">
                            {section.title}
                        </h3>

                        <ul className="px-4">
                            {section.content.length > 0
                                ? section.content.map((item, index) => (
                                    <li
                                        key={index}
                                        className="
                                            py-2
                                            flex justify-between items-center
                                            text-titleText dark:text-titleText-dark
                                            border-b border-white/20 dark:border-white/5
                                            last:border-b-0
                                        "
                                    >
                                        {item.image ? (
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="
                                                    h-9 w-9 rounded-2xl
                                                    border border-white/40 dark:border-white/10
                                                    bg-white/70 dark:bg-white/5
                                                    backdrop-blur-xl
                                                    shadow-[0_8px_20px_-14px_rgba(0,0,0,0.6)]
                                                    flex items-center justify-center
                                                    shrink-0
                                                ">
                                                    <img src={item.image} alt="Logo" className="w-6 h-6" />
                                                </div>

                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <strong className="break-words">{item.title}</strong>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="whitespace-normal break-words">
                                                            {item.content}
                                                        </span>
                                                        {sectionIndex < 2 ? (
                                                            <button
                                                                onClick={() =>
                                                                    navigator.clipboard.writeText(String(item.content))
                                                                }
                                                                className="
                                                                    p-1
                                                                    rounded-lg
                                                                    border border-white/40 dark:border-white/10
                                                                    bg-white/70 dark:bg-white/5
                                                                    backdrop-blur-xl
                                                                    shadow-[0_8px_20px_-14px_rgba(0,0,0,0.6)]
                                                                    hover:bg-white/90 dark:hover:bg-white/10
                                                                    transition
                                                                "
                                                                title="کپی محتوا"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={2}
                                                                >
                                                                    <path d="M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2" />
                                                                    <rect
                                                                        x="9"
                                                                        y="3"
                                                                        width="13"
                                                                        height="13"
                                                                        rx="2"
                                                                        ry="2"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col min-w-0 w-full">
                                                {item.title ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold break-words">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                ) : null}
                                                <div className="flex items-center gap-1">
                                                    <span className={`whitespace-normal break-words ${sectionIndex === 2 ? 'w-full' : ''}`}>
                                                        {item.content}
                                                    </span>
                                                    {sectionIndex < 2 ? (
                                                        <button
                                                            onClick={() => {
                                                                toast.success("در کلیپ‌بورد ذخیره شد.", {
                                                                    position: "bottom-left",
                                                                });
                                                                navigator.clipboard.writeText(String(item.content));
                                                            }}
                                                            className="
                                                                p-1
                                                                rounded-lg
                                                                border border-white/40 dark:border-white/10
                                                                bg-white/70 dark:bg-white/5
                                                                backdrop-blur-xl
                                                                shadow-[0_8px_20px_-14px_rgba(0,0,0,0.6)]
                                                                hover:bg-white/90 dark:hover:bg-white/10
                                                                transition
                                                            "
                                                            title="کپی محتوا"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path d="M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2" />
                                                                <rect
                                                                    x="9"
                                                                    y="3"
                                                                    width="13"
                                                                    height="13"
                                                                    rx="2"
                                                                    ry="2"
                                                                />
                                                            </svg>
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))
                                :
                                null
                            }
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default DetailBox;
