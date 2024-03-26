import { useContext } from "react";
import ThemeMode from "./ThemeMode";
import { UserDetails } from "../App";
import userPng from "../../assets/user.png";

const SidebarHeader = () => {

  const { userDetails } = useContext(UserDetails);
  return (
    <div className="flex items-center justify-between h-[15vh] px-4 pt-5 flex-[2]">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img
            className={`w-12 h-12 rounded-full`}
            style={{ backgroundColor: userDetails.profile_color }}
            src={userPng}
          />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900 dark:text-lightWhite ml-1">
            {userDetails.username}
          </div>
          <div className="text-xs font-medium text-gray-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-300 text-green-800">
              Online
            </span>
          </div>
        </div>
      </div>
      <ThemeMode />
    </div>
  );
};

export default SidebarHeader;
