import { useNavigate } from "react-router-dom";
import profilePng from "../../assets/user.png";
import { SocketContext } from "../Top";
import { useContext, useEffect } from "react";
import { ChatLoader } from "../App";

const SearchResultContact = ({
  id,
  username,
  profile_color,
  setShowContactsOrSearchResults,
  setForcedUpdate,
  setSearchQuery,
}) => {
  id = id.toString();
  const { socket } = useContext(SocketContext);
  const { setChatLoader } = useContext(ChatLoader);

  const navigate = useNavigate();

  const handleClick = () => {
    setChatLoader(true);
    socket.emit("find_room", id);
  };

  useEffect(() => {
    socket.on("room_found", (room_id) => {
      setSearchQuery("");
      navigate(
        `/messaging/${"?room_id=" +
        room_id
        }`
      )
      setChatLoader(false);
      setShowContactsOrSearchResults("contacts");
      setTimeout(() => {
        setForcedUpdate((prev) => prev + 1);
      }, 1000);
    });
    return () => {
      socket.off("room_found");
    };
  }, []);

  return (
    <div
      className={`flex items-center py-2 px-4  cursor-pointer dark:bg-gray-700 dark:text-black  bg-gray-800}`}
      onClick={handleClick}
    >
      <img
        src={profilePng}
        alt="Profile Image"
        className="w-10 h-10 rounded-full mr-4"
        style={{ backgroundColor: profile_color }}
      />
      <div className="flex flex-col">
        <p className={`text-lg font-medium dark:text-black text-white}`}>
          {username}
        </p>
      </div>
    </div>
  );
};

export default SearchResultContact;
