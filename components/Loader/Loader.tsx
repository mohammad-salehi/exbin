type LoaderProps = {
    size: number;
    color: string;
};

export const LoaderCircle = ({ size, color }: LoaderProps) => {
    return (
        <div
            aria-label="Loading"
            role="alert"
            aria-busy="true"
            className={`w-${size} h-${size} relative flex justify-center items-center rounded-full rtl:-scale-x-100`}
        >
            <div
                className={`border-4 ${color} absolute w-8 h-full rounded-full animate-spin border-x-transparent border-b-transparent`}
                style={{ animationDelay: "-0.45s" }}
                role="presentation"
            ></div>
            <div
                className={`border-4 ${color} absolute w-8 h-full rounded-full animate-spin border-x-transparent border-b-transparent`}
                style={{ animationDelay: "-0.3s" }}
                role="presentation"
            ></div>
            <div
                className={`border-4 ${color} absolute w-8 h-full rounded-full animate-spin border-x-transparent border-b-transparent`}
                style={{ animationDelay: "-0.15s" }}
                role="presentation"
            ></div>
            <div
                className={`border-4 ${color} absolute w-8 h-full rounded-full animate-spin border-x-transparent border-b-transparent`}
                role="presentation"
            ></div>
        </div>
    );
};
