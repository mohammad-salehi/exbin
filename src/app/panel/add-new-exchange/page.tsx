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
    const [ID, setID] = useState<number>()

    const titles = [
        {
            title: 'مشخصات کارگزاری'
        },
        {
            title: 'مدیرعامل'
        },
        {
            title: 'اعضای هیئت‌مدیره و سهامداران'
        },
        {
            title: 'نمایندگان'
        },
        {
            title: 'کارمندان'
        },
    ]
    return (
        <div className="px-4 xl:px-0 ">
            <ShowingStep titles={titles} step={Step} />
            <div className='w-full bg-boxBorderColor dark:bg-boxBorderColor-dark mt-4' style={{ height: '1px' }}></div>
            {Step === 1 && <GetExchangeInfo SetStep={SetStep} ID={ID} setID={setID} />}
            {Step === 2 && <Get_CEO_info SetStep={SetStep} ID={ID}  />}
            {Step === 3 && <BoardMemberInfo SetStep={SetStep} ID={ID}  />}
            {Step === 4 && <Exchange_Agent_Info SetStep={SetStep} ID={ID}  />}
            {Step === 5 && <Employee_Info SetStep={SetStep} ID={ID} />}
        </div>
    )
}

export default Page
