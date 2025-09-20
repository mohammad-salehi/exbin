import React, { JSX } from "react";

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
        <div className="shadow-lg rounded-lg overflow-x-hidden bg-white dark:bg-bgColor-dark border border-gray-200 dark:border-boxColor-dark mt-2 pb-2">
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 bg-white dark:bg-bgColor-dark">
                {data.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className={`${
                            sectionIndex !== data.length - 1 ? 'border-l border-gray-200 dark:border-boxColor-dark' : ''
                          }`}
                    >
                        <h3 className="text-xl font-semibold mb-4 bg-gray-100 dark:bg-boxColor-dark text-titleText dark:text-titleText-dark p-2 text-center">{section.title}</h3>
                        <ul className=" px-4 bg-white dark:bg-bgColor-dark">
                            {section.content.map((item, index) => (
                                <li key={index} className="py-2 flex justify-between items-center bg-white dark:bg-bgColor-dark text-titleText dark:text-titleText-dark">
                                    {item.image ? (
                                        <div className="flex items-center bg-white dark:bg-bgColor-dark">
                                            <img
                                                src={item.image} 
                                                alt="Logo"
                                                className="w-8 h-8 ml-2" 
                                            />
                                            <strong className="">{item.title}</strong>
                                        </div>
                                    ) : (
                                        <div className="flex items-center bg-white dark:bg-bgColor-dark text-titleText dark:text-titleText-dark">
                                            {
                                                item.title ?
                                                    <span className="">{item.title}:</span>
                                                    :
                                                    null
                                            }
                                            <span className="mr-2">{item.content}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DetailBox;
