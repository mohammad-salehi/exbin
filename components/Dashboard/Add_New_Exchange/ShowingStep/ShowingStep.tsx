import React from 'react'
interface ShowingSteps {
    step: number;
    titles: Array<{
        title: string;
    }>
}
const ShowingStep: React.FC<ShowingSteps> = ({ step, titles }) => {
    return (
        <div>
            {
                titles.map((item, index) => {
                    return (
                        <div className='inline-block' key={index}>
                            <div className={` inline-block xl:ml-4 xl:px-8 lg:ml-2 lg:px-4 md:ml-2 md:px-2 ml-2 px-1 py-1 md:py-2 rounded-lg border bg-white dark:bg-boxColor-dark ${step === (index + 1) ? "border-primary text-primary" : "text-titleText dark:text-titleText-dark dark:border-boxBorderColor-dark"}`}>
                                <span className='hidden md:inline-block'>
                                    {item.title}
                                </span>
                                <span className='inline-block md:hidden px-2'>
                                    {index + 1}
                                </span>
                            </div>
                            {
                                index < (titles.length - 1)?
                                    <div className='inline-block w-4 dark:bg-boxBorderColor-dark bg-boxBorderColor  xl:ml-4 lg:ml-2 md:ml-2 ml-2' style={{height:'1px'}}>
                                    </div>
                                    :
                                    null
                            }
                        </div>

                    )
                })
            }
        </div>
    )
}

export default ShowingStep
