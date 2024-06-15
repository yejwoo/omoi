import React from "react";

const SkeletonHeader = () => {
  return (
    <header className="z-[99] bg-white dark:bg-gray-800 w-full shadow fixed md:h-16 bottom-0 md:top-0">
      {/* PC */}
      <nav className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 h-full items-center hidden md:block">
        <div className="flex justify-between items-center gap-4 w-full">
          <div className="flex gap-8 items-center">
            <div className="flex-shrink-0 flex items-center bg-gray-200 rounded-full">
              <div className="relative w-[72px] h-[28px]"></div>
            </div>
            <ul className="flex gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
            </ul>
          </div>
          <div>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="inline-block w-28 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* 모바일 */}
      <nav className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 block md:hidden">
        <ul className="flex gap-2">
          <li className="w-1/3 p-2 flex justify-center items-center"><div className="w-7 h-7 rounded-full bg-gray-200"></div></li>
          <li className="w-1/3 p-2 flex justify-center items-center"><div className="w-7 h-7 rounded-full bg-gray-200"></div></li>
          <li className="w-1/3 p-2 flex justify-center items-center"><div className="w-7 h-7 rounded-full bg-gray-200"></div></li>
        </ul>
      </nav>
    </header>
  );
};

export default SkeletonHeader;
