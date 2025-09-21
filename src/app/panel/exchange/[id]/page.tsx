"use client";

import React from 'react'
import CeoDetail from '../../../../../components/Dashboard/Exchange_page/CeoDetail/CeoDetail';
import BoardMemberTable from '../../../../../components/Dashboard/Exchange_page/BoardMemberInfo/BoardMemberInfo';
import ExchangeAgentInfo from '../../../../../components/Dashboard/Exchange_page/ExchangeAgentInfo/ExchangeAgentInfo';
import EmployeeInfo from '../../../../../components/Dashboard/Exchange_page/EmployeeInfo/EmployeeInfo';
import Exchange_info from '../../../../../components/Dashboard/Exchange_page/Exchange_info/Exchange_info';

const Page = () => {
    
    return (
        <div className='px-4 xl:px-0 mb-4'>
            <Exchange_info/>
            <CeoDetail/>
            <BoardMemberTable/>
            <ExchangeAgentInfo/>
            <EmployeeInfo/>
        </div>
    )
}

export default Page
