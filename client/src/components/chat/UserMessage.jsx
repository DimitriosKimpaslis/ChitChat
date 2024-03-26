import { formatTime } from "../../lib/formatTime";
import Tooltip from '@mui/material/Tooltip';

const UserMessage = ({ message, time }) => {
  const formatedDate = formatTime(time);
  return (
    <div className="bg-gray-700 dark:bg-[#0f0f0f] rounded-md px-2 py-1 ml-auto max-w-[600px]">
      <p className="italic text-gray-400 dark:text-gray-300 text-xs">{formatedDate.time}</p>
      <Tooltip title={<p className="text-sm">Send by you at {formatedDate.date}</p>}>
        <p className="text-sm text-gray-100">{message}</p>
      </Tooltip>
    </div>

  );
};

export default UserMessage;
