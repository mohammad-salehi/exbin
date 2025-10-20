import React from "react";
import { Button } from "@heathmont/moon-core-tw";
import { Clock } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
        <Clock className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-titleText dark:text-titleText-dark mb-3">
        به‌زودی در دسترس خواهد بود
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        این بخش هنوز آماده نیست، اما تیم ما در حال کار روی آن برای فاز بعدی است. لطفاً به‌زودی
        دوباره سر بزنید.
      </p>

    </div>
  );
};

export default ComingSoon;
