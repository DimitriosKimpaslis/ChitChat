import { useContext } from "react";
import profilePng from "../../assets/user.png";
import { ChatLoader } from "../App";
import { CircularProgress } from "@mui/material";

const ChatHeader = ({info}) => {
  const { chatLoader, setChatLoader } = useContext(ChatLoader);

  return (

    <div className="flex items-center p-4 border-b dark:bg-dark border-black dark:border-customGray h-[10vh]">
      {chatLoader ? (
        <div className="text-center" >
          <CircularProgress />
        </div >
      ) : (
        <>
          <img
            src={profilePng}
            alt={'profile'}
            className={`rounded-full w-12 h-12`}
            style={{ backgroundColor: info.profile_color }}
          />
          <span className="ml-4 dark:text-white text-lg">{info.room_name}</span></>)}
      </div>
    
  );
};

export default ChatHeader;
