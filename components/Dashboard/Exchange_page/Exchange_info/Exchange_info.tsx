import React, { JSX, useEffect, useState } from 'react'
import DetailBox from '../../../DetailBox/DetailBox'
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import { GetRequest } from '../../../../functions/GetRequest';
import { useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';

interface InvoiceContent {
    id: number;
    title: string;
    content: React.ReactNode;
}

interface InvoiceSection {
    id: number;
    title: string;
    content: InvoiceContent[];
}

const Exchange_info = () => {
    const params = useParams<{ id: string }>();
    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");

    const [invoiceData, setInvoiceData] = useState<InvoiceSection[]>([
        {
            id: 1,
            title: "مشخصات پایه",
            content: [
                { id: 1, title: "نام حقوقی", content: '' },
                { id: 2, title: "تاریخ تاسیس", content: "" },
                { id: 3, title: "شناسه ملی صرافی", content: "" },
                { id: 4, title: "نوع صرافی", content: "" },
                { id: 5, title: "شکل حقوقی صرافی", content: "" },
                { id: 6, title: "کد اقتصادی", content: "" },
                { id: 7, title: "شماره ثبت", content: "" },
            ],
        },
        {
            id: 2,
            title: "اطلاعات تماس",
            content: [
                { id: 1, title: "آدرس سایت", content: "" },
                { id: 2, title: "شماره تماس", content: "" },
                { id: 3, title: "شماره تماس اضطراری", content: "" },
                { id: 4, title: "آدرس", content: "" },
                { id: 5, title: "ایمیل", content: "" },

            ],
        },
        {
            id: 3,
            title: "اسناد",
            content: [
                {
                    id: 1,
                    title: "اساسنامه",
                    content: "",
                }

            ],
        },
        {
            id: 4,
            title: "عملیات",
            content: [
                {
                    id: 1,
                    content: (
                        <div className='text-center w-full cursor-pointer' onClick={() => { setIsOpen(true); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className='inline-block ml-1'>
                                <path d="M13.2594 3.60022L5.04936 12.2902C4.73936 12.6202 4.43936 13.2702 4.37936 13.7202L4.00936 16.9602C3.87936 18.1302 4.71936 18.9302 5.87936 18.7302L9.09936 18.1802C9.54936 18.1002 10.1794 17.7702 10.4894 17.4302L18.6994 8.74022C20.1194 7.24022 20.7594 5.53022 18.5494 3.44022C16.3494 1.37022 14.6794 2.10022 13.2594 3.60022Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.8906 5.0498C12.3206 7.8098 14.5606 9.9198 17.3406 10.1998" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 22H21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>ویرایش</span>

                        </div>

                    ),
                    title: ''
                },
            ],
        },
    ]);
    const [Loading, setLoading] = useState<boolean>(false)
    const handleEdit = (sectionId: number, contentId: number, newContent: React.ReactNode) => {
        setInvoiceData((prevData) =>
            prevData.map((section) => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        content: section.content.map((item) => {
                            if (item.id === contentId) {
                                return { ...item, content: newContent };
                            }
                            return item;
                        }),
                    };
                }
                return section;
            })
        );
    };
    const addFinancialDocuments = (financialStatements: { id: number; date: string; file: string }[]) => {
        setInvoiceData(prevData => {
            return prevData.map(section => {
                if (section.id === 3) {
                    return {
                        ...section,
                        content: [
                            ...section.content,
                            ...financialStatements.map(statement => ({
                                id: statement.id + 100,
                                title: `صورت‌ مالی ${statement.date}`,
                                content: (
                                    <a href={statement.file} className="text-primary dark:text-primary-dark">
                                        دریافت
                                    </a>
                                )
                            }))
                        ]
                    };
                }
                return section;
            });
        });
    };

    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
            .then((response) => {
                SetLogo(response.result.logo)
                SetName(response.result.name)
                handleEdit(1, 1, response.result.legalName)
                handleEdit(1, 2, response.result.establishmentDate)
                handleEdit(1, 3, response.result.nationalCode)
                handleEdit(1, 4, response.result.type)
                handleEdit(1, 5, response.result.exchangeType)
                handleEdit(1, 6, response.result.financialCode)
                handleEdit(1, 7, String(response.result.registrationNumber))
                if (response.result.siteAddress !== "" && response.result.siteAddress !== null) {
                    handleEdit(2, 1, <a href={response.result.siteAddress} className="text-primary dark:text-primary-dark">
                        {response.result.siteAddress}
                    </a>)
                }

                handleEdit(2, 2, response.result.phoneNumber)
                handleEdit(2, 3, response.result.emergencyPhoneNumber)
                handleEdit(2, 4, response.result.officeAddress)
                handleEdit(2, 5, response.result.email)
                if (response.result.association !== null && response.result.association !== "") {
                    handleEdit(3, 1, <a href={response.result.association} className="text-primary dark:text-primary-dark">
                        دریافت
                    </a>)
                }


                addFinancialDocuments(response.result.financialStatements)

                setForm({
                    legalName: response.result.legalName,
                    establishmentDate: response.result.establishmentDate,
                    nationalCode: response.result.nationalCode,
                    type: response.result.type,
                    exchangeType: response.result.exchangeType,
                    siteAddress: response.result.siteAddress,
                    phoneNumber: response.result.phoneNumber,
                    emergencyPhoneNumber: response.result.emergencyPhoneNumber,
                    officeAddress: response.result.officeAddress,
                    email: response.result.email,
                    financialCode: response.result.financialCode,
                    registrationNumber: response.result.registrationNumber,
                });
            })
    }, [])


    const [form, setForm] = useState({
        legalName: '',
        establishmentDate: '',
        nationalCode: '',
        type: '',
        exchangeType: '',
        siteAddress: '',
        phoneNumber: '',
        emergencyPhoneNumber: '',
        officeAddress: '',
        email: '',
        financialCode: '',
        registrationNumber: '',
    });
    const [isOpen, setIsOpen] = useState(false);
    const handleSave = () => {
        setLoading(true)
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
            .then(async (response) => {
                const managerInfo = response.result

                managerInfo.legalName = form.legalName
                managerInfo.establishmentDate = form.establishmentDate
                managerInfo.nationalCode = form.nationalCode
                managerInfo.type = form.type
                managerInfo.exchangeType = form.exchangeType
                managerInfo.siteAddress = form.siteAddress
                managerInfo.phoneNumber = form.phoneNumber
                managerInfo.emergencyPhoneNumber = form.emergencyPhoneNumber
                managerInfo.officeAddress = form.officeAddress
                managerInfo.email = form.email
                managerInfo.financialCode = form.financialCode
                managerInfo.registrationNumber = form.registrationNumber
                managerInfo.exchangeAgentInfo = []
                managerInfo.boardMemberInfo = []
                managerInfo.employeeInfo = []

                console.log(managerInfo)
                try {
                    const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

                    if (!token) {
                        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                        return;
                    }

                    setLoading(true)
                    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(managerInfo),
                    });

                    if (!response.ok) {
                        console.log(response)
                        setLoading(false)
                        return toast.error(`خطا در ذخیره مدیرعامل`);
                    } else {
                        const responseData = await response.json();
                        console.log(responseData);
                        toast.success("مشخصات با موفقیت ذخیره شد.", { position: "bottom-left" });
                        setLoading(false)
                        setInvoiceData((prev) => {
                            const newData = [...prev];
                            newData[0].content = [
                                { id: 1, title: "نام حقوقی", content: form.legalName },
                                { id: 2, title: "تاریخ تاسیس", content: form.establishmentDate },
                                { id: 3, title: "شناسه ملی صرافی", content: form.nationalCode },
                                { id: 4, title: "نوع صرافی", content: form.type },
                                { id: 5, title: "شکل حقوقی صرافی", content: form.exchangeType },
                                { id: 6, title: "کد اقتصادی", content: form.financialCode },
                                { id: 7, title: "شماره ثبت", content: String(form.registrationNumber) },
                            ];
                            newData[1].content = [
                                {
                                    id: 1,
                                    title: "آدرس سایت",
                                    content: (
                                        <a href={form.siteAddress} className="text-primary dark:text-primary-dark">
                                            {form.siteAddress}
                                        </a>
                                    ),
                                },
                                { id: 2, title: "شماره تماس", content: form.phoneNumber },
                                { id: 3, title: "شماره تماس اضطراری", content: form.emergencyPhoneNumber },
                                { id: 4, title: "آدرس", content: form.officeAddress },
                                { id: 5, title: "ایمیل", content: form.email },
                            ];

                            return newData;
                        });

                        setIsOpen(false);
                    }

                } catch (err) {
                    setLoading(false)
                    console.error(err);
                    return toast.error(`خطا در ذخیره مدیرعامل`);
                }
            })
            .catch((err) => {
                console.log(err)
                return toast.error(`خطا در ذخیره مدیرعامل`);
            })


    };

    return (
        <div>
            {
                logo !== null && logo !== '' ?
                    <img alt="image" className='w-8 h-8 inline-block' src={logo} />
                    :
                    <div className=" items-center text-titleText dark:text-titleText-dark inline-block " style={{ marginBottom: '-6px' }}>
                        <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.2639 15.9376L12.5958 14.2835C11.7909 13.4852 11.3884 13.0861 10.9266 12.9402C10.5204 12.8119 10.0838 12.8166 9.68048 12.9537C9.22188 13.1096 8.82814 13.5173 8.04068 14.3327L4.04409 18.2802M14.2639 15.9376L14.6053 15.5991C15.4112 14.7999 15.8141 14.4003 16.2765 14.2544C16.6831 14.1262 17.12 14.1312 17.5236 14.2688C17.9824 14.4252 18.3761 14.834 19.1634 15.6515L20 16.4936M14.2639 15.9376L18.275 19.9566M20.9992 6.00011H14.9992M11 3.99951L7.2 4.00011C6.07989 4.00011 5.51984 4.00011 5.09202 4.21809C4.71569 4.40984 4.40973 4.7158 4.21799 5.09213C4 5.51995 4 6.08 4 7.20011V16.8001C4 17.4576 4 17.9222 4.04409 18.2802M20 9.99951V16.4936M4.04409 18.2802C4.07512 18.5322 4.12796 18.7314 4.21799 18.9081C4.40973 19.2844 4.71569 19.5904 5.09202 19.7821C5.51984 20.0001 6.07989 20.0001 7.2 20.0001H16.8C17.9201 20.0001 18.4802 20.0001 18.908 19.7821C19.2843 19.5904 19.5903 19.2844 19.782 18.9081C20 18.4803 20 17.9202 20 16.8001V16.4936" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
            }
            <h3 className='inline-block text-2xl text-bold mr-2 text-titleText dark:text-titleText-dark' >
                {name}
            </h3>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark mt-4'>
                مشخصات صرافی
            </h5>
            <DetailBox
                data={invoiceData.map((section) => ({
                    title: section.title,
                    content: section.content.map((item) => ({
                        title: item.title,
                        content: typeof item.content === 'string' ? item.content : React.isValidElement(item.content) ? item.content : '', // تبدیل به string یا Element
                    })),
                }))}
                downloadLink="/path/to/pdf"
            />


            <Modal open={isOpen} onClose={() => setIsOpen(false)}>
                <Modal.Backdrop />
                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold">ویرایش مشخصات صرافی {"نوبیتکس"}</Modal.Title>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام حقوقی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
                            </div>
                            <div>
                                <label>تاریخ تأسیس</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.establishmentDate} onChange={(e) => setForm({ ...form, establishmentDate: e.target.value })} />
                            </div>
                            <div>
                                <label>شناسه ملی صرافی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => setForm({ ...form, nationalCode: e.target.value })} />
                            </div>
                            <div>
                                <label>نوع صرافی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                            </div>
                            <div>
                                <label>کد اقتصادی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.financialCode} onChange={(e) => setForm({ ...form, financialCode: e.target.value })} />
                            </div>
                            <div>
                                <label>شماره ثبت</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
                            </div>
                            <div>
                                <label>شکل حقوقی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.exchangeType} onChange={(e) => setForm({ ...form, exchangeType: e.target.value })} />
                            </div>
                            <div>
                                <label>آدرس سایت</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.siteAddress} onChange={(e) => setForm({ ...form, siteAddress: e.target.value })} />
                            </div>
                            <div>
                                <label>شماره تماس</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                            </div>
                            <div>
                                <label>شماره تماس اضطراری</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.emergencyPhoneNumber} onChange={(e) => setForm({ ...form, emergencyPhoneNumber: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label>آدرس دفتر</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} />
                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>انصراف</Button>
                            <Button variant="primary" onClick={handleSave}>
                                {
                                    Loading ?
                                        <LoaderCircle size={8} color="border-white-500" />
                                        :
                                        "ذخیره"
                                }
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>

            </Modal>
        </div>
    )
}

export default Exchange_info
