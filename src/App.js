import React from "react";
import { FaBars } from "react-icons/fa";
import { useGlobalContext } from "./context";
import ReactFlowProviderContent from "./ReactFlowProviderContent";
const App = () => {
  const { openSidebar, isSidebarOpen } = useGlobalContext();

  return (
    <div className="">
      {/* NavBar */}
      <div className="flex flex-row w-full gap-10 pb-4 shadow-sm p-[13px] ">
        <div>
          <button
            onClick={openSidebar}
            className={`${
              isSidebarOpen ? "-translate-x-8" : "translate-x-0"
            } fixed mt-3 top-2 transition transform ease-linear duration-500 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-300 focus:outline-none  hover:bg-gray-200 hover:text-gray-800`}
          >
            <FaBars className="w-5 h-5" />{" "}
          </button>
        </div>
        <div>
          <h2
            className={` mt-[0.34rem]    text-3xl font-semibold text-gray-700`}
          >
            Mind <span className="-ml-1 text-pink-500">MAP</span>
          </h2>
        </div>
      </div>
      <div>
        <ReactFlowProviderContent />
      </div>
    </div>
  );
};

export default App;
