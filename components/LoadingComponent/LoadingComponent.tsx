import React from 'react'

const LoadingComponent = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-titleText dark:text-titleText-dark">درحال دریافت اطلاعات...</p>
        </div>
    )
}

export default LoadingComponent
