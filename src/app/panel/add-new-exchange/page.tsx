"use client"

import React, { useEffect, useState } from 'react'
import ShowingStep from '../../../../components/Dashboard/Add_New_Exchange/ShowingStep/ShowingStep'
import GetExchangeInfo from '../../../../components/Dashboard/Add_New_Exchange/GetExchangeInfo/GetExchangeInfo'
import Get_CEO_info from '../../../../components/Dashboard/Add_New_Exchange/Get_CEO_info/Get_CEO_info'
const Page = () => {

    const [Step, SetStep] = useState<number>(2)

    interface Step1DataTypes {
        name: string;
        legalName: string;
        nationalCode: string;
        establishmentDate: string;
        type: string;
        exchangeType: string;
        financialCode: string;
        logo: string;
        siteAddress: string;
        emergencyPhoneNumber: string;
        officeAddress: string;
        email: string;
    }
    interface Step2DataTypes {
        name:string;
        phoneNumber:string;
        nationalCode:string;
        educationalHistory:string;
        careerHistory:string;
        sharePercentage:number | null;
        email:string;
    }

    const [step1Data, setStep1Data] = useState<Step1DataTypes>({
        name: "",
        legalName: "",
        nationalCode: "",
        establishmentDate: "",
        type: "",
        exchangeType: "",
        financialCode: "",
        logo: "",
        siteAddress: "",
        emergencyPhoneNumber: "",
        officeAddress: "",
        email: "",
    });
    const [step2Data, setStep2Data] = useState<Step2DataTypes>({
        name: "",
        phoneNumber: "",
        nationalCode: "",
        educationalHistory: "",
        careerHistory: "",
        sharePercentage: null,
        email: "",
    });

    const titles = [
        {
            title: 'مشخصات صرافی'
        },
        {
            title: 'مشخصات مدیرعامل'
        },
        {
            title: 'مشخصات عضو هیت مدیره'
        },
        {
            title: 'مشخصات نماینده صرافی'
        },
        {
            title: 'مشخصات کارمند '
        },
    ]
    return (
        <div className="px-4 xl:px-0 ">
            <ShowingStep titles={titles} step={Step} />
            <div className='w-full bg-boxBorderColor dark:bg-boxBorderColor-dark mt-4' style={{ height: '1px' }}></div>
            {Step === 1 && <GetExchangeInfo SetStep={SetStep} step1Data={step1Data} setStep1Data={setStep1Data} />}
            {Step === 2 && <Get_CEO_info SetStep={SetStep} step2Data={step2Data} setStep2Data={setStep2Data} />}
        </div>
    )
}

export default Page
