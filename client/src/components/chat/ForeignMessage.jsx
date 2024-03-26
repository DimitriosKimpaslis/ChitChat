import profilePng from "../../assets/user.png";
import { formatTime } from "../../lib/formatTime";
import { Tooltip } from "@mui/material";


const ForeignMessage = ({ message, time, sender }) => {

  const formatedDate = formatTime(time);
  return (
    <div className="flex mr-auto max-w-[600px] gap-2">
      <img
        src={profilePng}
        alt="Profile Image"
        className="w-8 h-8 rounded-full mr-1"
        style={{ backgroundColor: sender?.profile_color }}

      />

      <div className="bg-gray-200 dark:bg-[#0c0c0c] rounded-md px-2 py-1">
        <p className="italic text-gray-600 text-xs">{formatedDate.time}</p>
        <Tooltip title={<p className="text-sm">Send by {sender.username} at {formatedDate.date}</p>}>
        <p className="text-sm dark:text-gray-200">{message}</p>
      </Tooltip>

    </div>

    </div >
  );
};

export default ForeignMessage;
