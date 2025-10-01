import { Button, Label } from "@heathmont/moon-core-tw";
import React, { JSX, useState } from "react";
import toast from "react-hot-toast";
import { Modal, Input } from "@heathmont/moon-core-tw";
import { Dropdown, MenuItem } from "@heathmont/moon-core-tw";

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
    function closeModal(): void {
        throw new Error("Function not implemented.");
    }

    const [type, Settype] = useState<string>("")
    const [AddFileModal, SetAddFileModal] = useState<boolean>(false)
    const handleSelectChange = (event: string) => {
        Settype(event);
    };
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         SetLogo(reader.result as string);
    //     };
    //     reader.readAsDataURL(file);
    //     setFileName(file.name)
    // };
    return (
        <div className="shadow-lg rounded-lg overflow-x-hidden bg-white dark:bg-bgColor-dark border border-gray-200 dark:border-boxColor-dark mt-2 pb-2">
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 bg-white dark:bg-bgColor-dark">
                {data.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className={`${sectionIndex !== data.length - 1
                            ? "border-l border-gray-200 dark:border-boxColor-dark"
                            : ""
                            }`}
                    >
                        <h3 className="text-xl font-semibold mb-4 bg-gray-100 dark:bg-boxColor-dark text-titleText dark:text-titleText-dark p-2 text-center">
                            {section.title}
                        </h3>
                        <ul className="px-4 bg-white dark:bg-bgColor-dark">
                            {section.content.length > 0
                                ? section.content.map((item, index) => (
                                    <li
                                        key={index}
                                        className="py-2 flex justify-between items-center bg-white dark:bg-bgColor-dark text-titleText dark:text-titleText-dark"
                                    >
                                        {item.image ? (
                                            <div className="flex items-center gap-2 min-w-0">
                                                <img src={item.image} alt="Logo" className="w-8 h-8 ml-2" />
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
                                                                className="p-1 hover:text-blue-500"
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
                                            <div className="flex flex-col min-w-0">
                                                {item.title ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold break-words">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                ) : null}
                                                <div className="flex items-center gap-1">
                                                    <span className="whitespace-normal break-words">
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
                                                            className="p-1 hover:text-blue-500"
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
                                <div className="text-titleText dark:text-titleText-dark text-center mt-8">
                                    موردی یافت نشد!
                                    <Button variant="primary" className='text-primary dark:text-primary-dark border border-primary rounded-md w-full mt-8' onClick={() => {SetAddFileModal(true)}}>
                                        افزودن مورد جدید
                                    </Button>
                                </div>
                            }
                        </ul>
                    </div>
                ))}
            </div>

            <Modal open={AddFileModal} onClose={ () => {SetAddFileModal(false)}}>
                <Modal.Backdrop />
                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold">
                                افزودن فایل
                            </Modal.Title>

                            <Label className="mt-4">نوع فایل</Label>
                            <Dropdown onChange={handleSelectChange} value={type} >
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-bgColor dark:bg-bgColor-dark"
                                    >
                                        <span>{type !== "" ? type : "انتخاب"}</span>
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Options
                                    className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                                >
                                    <Dropdown.Option value="اساسنامه" key="option1">
                                        {({ selected, active }) => (
                                            <MenuItem
                                                isActive={active}
                                                isSelected={selected}
                                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "اساسنامه"
                                                    ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                    : ""
                                                    }`}
                                            >
                                                <MenuItem.Title>اساسنامه</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                    <Dropdown.Option value="صورت مالی" key="option2">
                                        {({ active }) => (
                                            <MenuItem
                                                isActive={active}
                                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "صورت مالی"
                                                    ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                    : ""
                                                    }`}
                                            >
                                                <MenuItem.Title>صورت مالی</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                </Dropdown.Options>
                            </Dropdown>
                            {
                                type === 'صورت مالی' ?
                                    <div>
                                        <Label className="mt-4">عنوان</Label>
                                        <Input placeholder='عنوان صورت مالی(تاریخ)' className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                                    </div>
                                    :
                                    null
                            }

                            <Label className="mt-4">بارگذاری</Label>
                            <label className="block cursor-pointer p-2 rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm">
                                <span>
                                    انتخاب فایل
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    // onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            <Button
                                variant="primary"
                                // onClick={openAddModal}
                                className="bg-primary dark:bg-primary-dark border text-white border-primary rounded-md w-full mt-4"
                            >
                                بارگذاری
                            </Button>
                        </div>

                    </Modal.Panel>
                </div>
            </Modal>

        </div>
    );
};

export default DetailBox;
