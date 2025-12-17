import React, { useEffect, useState } from 'react'
import Exchange_info from '../Exchange_info/Exchange_info';
import CeoDetail from '../CeoDetail/CeoDetail';
import BoardMemberTable from '../BoardMemberInfo/BoardMemberInfo';
import ExchangeAgentInfo from '../ExchangeAgentInfo/ExchangeAgentInfo';
import EmployeeInfo from '../EmployeeInfo/EmployeeInfo';

type ExchangeInfoProps = {
    SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ExchangeIdentify = ({SetLoading} : ExchangeInfoProps) => {

    const [C1, SetC1] = useState<boolean>(false);
    const [C2, SetC2] = useState<boolean>(false);
    const [C3, SetC3] = useState<boolean>(false);
    const [C4, SetC4] = useState<boolean>(false);
    const [C5, SetC5] = useState<boolean>(false);
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    useEffect(() => {
        if (C1 && C2 && C3 && C4 && C5) {
            SetIsLoading(false);
        }
    }, [C1, C2, C3, C4, C5]);
    useEffect(() => {
        SetLoading(IsLoading)
    },[IsLoading])
    return (
        <div>
            <Exchange_info SetC1={SetC1} />
            <CeoDetail SetC2={SetC2} />
            <BoardMemberTable SetC3={SetC3} />
            <ExchangeAgentInfo SetC4={SetC4} />
            <EmployeeInfo SetC5={SetC5} />
        </div>
    )
}

export default ExchangeIdentify
