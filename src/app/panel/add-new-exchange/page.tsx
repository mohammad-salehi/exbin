"use client"

import React, { useEffect, useState } from 'react'
import ShowingStep from '../../../../components/Dashboard/Add_New_Exchange/ShowingStep/ShowingStep'
import GetExchangeInfo from '../../../../components/Dashboard/Add_New_Exchange/GetExchangeInfo/GetExchangeInfo'
import Get_CEO_info from '../../../../components/Dashboard/Add_New_Exchange/Get_CEO_info/Get_CEO_info'
import BoardMemberInfo from '../../../../components/Dashboard/Add_New_Exchange/Board_member_info/BoardMemberInfo'
import Exchange_Agent_Info from '../../../../components/Dashboard/Add_New_Exchange/Exchange_Agent_Info/Exchange_Agent_Info'
import Employee_Info from '../../../../components/Dashboard/Add_New_Exchange/Employee_Info/Employee_Info'

const Page = () => {

    const [Step, SetStep] = useState<number>(1)

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
        fileName: string;
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
    interface Step3DataTypes {
        id: string;
        name: string;
        phoneNumber: string;
        nationalCode: string;
        role: string;
        careerHistory: string;
        educationalHistory: string;
        sharePercentage: number | null;
        email: string;
    }
    interface Step4DataTypes {
        id: string;
        name: string;
        phoneNumber: string;
        nationalCode: string;
    }
    interface Step5DataTypes {
        id:string
        name: string,
        jobPosition: string,
        startDate: string,
        educationalHistory: string,
        careerHistory: string,
        insuranceStartDate: string,
        insuranceEndDate: string,
        isSpecialAccess: boolean | null,
        nationalCode: string,
        phoneNumber: string
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
        fileName:""
    })
    const [step2Data, setStep2Data] = useState<Step2DataTypes>({
        name: "",
        phoneNumber: "",
        nationalCode: "",
        educationalHistory: "",
        careerHistory: "",
        sharePercentage: null,
        email: "",
    })
    const [step3Data, setStep3Data] = useState<Step3DataTypes[]>([])
    const [step4Data, setStep4Data] = useState<Step4DataTypes[]>([])
    const [step5Data, setStep5Data] = useState<Step5DataTypes[]>([])

    const saveExchange = () => {
        console.log(step1Data)
        console.log(step2Data)
        console.log(step3Data)
        console.log(step4Data)
        console.log(step5Data)
    }
    const titles = [
        {
            title: 'مشخصات صرافی'
        },
        {
            title: 'مشخصات مدیرعامل'
        },
        {
            title: 'مشخصات اعضای هیئت‌مدیره'
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
            {Step === 3 && <BoardMemberInfo SetStep={SetStep} step3Data={step3Data} setStep3Data={setStep3Data}/>}
            {Step === 4 && <Exchange_Agent_Info SetStep={SetStep} step4Data={step4Data} setStep4Data={setStep4Data}/>}
            {Step === 5 && <Employee_Info SetStep={SetStep} step5Data={step5Data} setStep5Data={setStep5Data} saveExchange={saveExchange}/>}
        </div>
    )
}

export default Page
