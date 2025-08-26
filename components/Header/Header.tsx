'use client';

type NavbarProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    toggleDarkMode: () => void; // اصلاح تایپ
};

export default function Header({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen, toggleDarkMode }: NavbarProps) {

    const closeSidebar = () => {
        setIsMobileOpen(false);
    };
    
    return (
        <header className={`w-full h-18 bg-boxColor dark:bg-boxColor-dark flex items-stretch justify-between ${isOpen ? "rounded-bl-md rounded-br-md" : ""} shadow-sm px-6`}>
            {isMobileOpen && (
                <div
                    className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 opacity-50 z-40"
                    onClick={closeSidebar}
                ></div>
            )}
            <div className="flex items-center gap-5">
                {
                    isOpen ?
                        <div className="flex items-center gap-1 text-titleText dark:text-titleText-dark">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.5 2.5L21.5 7.5M21.5 2.5L16.5 7.5M12.5 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H17C17.93 21 18.395 21 18.7765 20.8978C19.8117 20.6204 20.6204 19.8117 20.8978 18.7765C21 18.395 21 17.93 21 17M10.5 8.5C10.5 9.60457 9.60457 10.5 8.5 10.5C7.39543 10.5 6.5 9.60457 6.5 8.5C6.5 7.39543 7.39543 6.5 8.5 6.5C9.60457 6.5 10.5 7.39543 10.5 8.5ZM14.99 11.9181L6.53115 19.608C6.05536 20.0406 5.81747 20.2568 5.79643 20.4442C5.77819 20.6066 5.84045 20.7676 5.96319 20.8755C6.10478 21 6.42628 21 7.06929 21H16.456C17.8951 21 18.6147 21 19.1799 20.7582C19.8894 20.4547 20.4547 19.8894 20.7582 19.1799C21 18.6147 21 17.8951 21 16.456C21 15.9717 21 15.7296 20.9471 15.5042C20.8805 15.2208 20.753 14.9554 20.5733 14.7264C20.4303 14.5442 20.2412 14.3929 19.8631 14.0905L17.0658 11.8527C16.6874 11.5499 16.4982 11.3985 16.2898 11.3451C16.1061 11.298 15.9129 11.3041 15.7325 11.3627C15.5279 11.4291 15.3486 11.5921 14.99 11.9181Z" stroke="#606060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className='mr-4'>علی اکبری</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500 mr-4 dark:text-gray-400">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        :
                        <div className="text-titleText dark:text-titleText-dark">
                            <svg className="cursor-pointer" width="28px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => { setIsMobileOpen(true) }}>
                                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                }

            </div>

            <div className="flex items-center p-4 pl-0">

                <button className="flex items-center justify-center border border-gray-200 bg-gray-100 hover:bg-gray-200 transition ml-2 h-9 w-9 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-700" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute ml-7 mb-7 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        12
                    </span>
                </button>
                {
                    isOpen ?
                        <div className="h-8 bg-gray-200 ml-4 mr-2" style={{ width: '1px' }}></div>
                        :
                        null
                }
                {
                    isOpen ?
                        <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md bg-gray-100 hover:bg-gray-200 transition p-2 ml-2" onClick={toggleDarkMode}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.828l1.414 1.414M17.95 17.95l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        :
                        null
                }


            </div>
        </header>
    );
}
