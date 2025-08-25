'use client';

export default function Header() {
    return (
        <header className="w-full h-36 bg-boxColor flex items-stretch justify-between  rounded-md shadow-lg px-6">
            <div className="flex items-center">
                <div className="flex items-center gap-1 text-titleText">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='mr-2'>
                        <path d="M10 12H18M18 12L15.5 9.77778M18 12L15.5 14.2222M18 7.11111V5C18 4.44772 17.5523 4 17 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V16.8889" stroke="#464455" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span className='mr-4'>علی اکبری</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500 mr-4">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            <div className="flex items-center p-4">


                <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md bg-gray-200 hover:bg-gray-200 transition p-2 ml-2" style={{borderRadius:'50%'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-700" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                <div className="h-5 w-8 bg-titleText"></div>

                <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md bg-gray-200 hover:bg-gray-200 transition p-2 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.828l1.414 1.414M17.95 17.95l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

            </div>
        </header>
    );
}
