import { SlOptions } from "react-icons/sl";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import profilePng from "../../assets/user.png";
import { ChatLoader, UserDetails } from "../App";
import { SocketContext } from "../Top";

const Contact = ({
  //contact doesnt need a room_name to connect but just to send messages because it will connect to all the rooms at the beginning of the app
  // that is something that will be done only for the search result contact because it is the one that will create the room
  room_id,
  id,
  username,
  // online,
  profile_color,
  showContactPanel,
  setShowContactPanel,
  activeContact,
  setActiveContact,
}) => {

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);

  const { userDetails } = useContext(UserDetails);


  const [lastMessage, setLastMessage] = useState({
    id: 0,
    message: "",
    user: '',
    time: '',
  });

  const [newMessage, setNewMessage] = useState(false);

  const seenJSX = () => {
    if (lastMessage.user === "You" && lastMessage.viewed === true) {
      return (
        <img
          src={profilePng}
          alt="Profile Image"
          className="w-4 h-4 rounded-full mr-4 flex-shrink-0"
          style={{ backgroundColor: profile_color }}

        />
      )
    }
  }

  const handleClick = () => {
    if (id === activeContact) {
      return;
    }
    setActiveContact(id);
    if (lastMessage.user !== "You" && lastMessage.viewed === false) {
      setTimeout(() => {
        //give some time for the last message state to get its value
        socket.emit("viewed", {
          message_id: lastMessage.id,
          room_id: room_id,
        });
      }, 1000);
    }
    setNewMessage(false);
    navigate(`/messaging/${"?room_id=" + room_id}`);
    // change the viewed status of the last message to true
  }

  useEffect(() => {
    const room_ident = new URLSearchParams(location.search).get("room_id");
    if (room_ident === room_id && lastMessage.viewed === false && lastMessage.user !== "You") {
      socket.emit("viewed", {
        message_id: lastMessage.id,
        room_id: room_id,
      });
    }


    socket.on("viewed", (data) => {
      if (data.room_id !== room_id) return;
      // if (lastMessage.viewed === true) return;
      if (data.message_id === lastMessage.id) {
        setLastMessage({
          ...lastMessage,
          viewed: true,
        });
      }
    });
    return () => {
      socket.off("viewed");
    };
  }, [location, lastMessage, socket]);

  const handleShowPanel = () => {
    if (showContactPanel === id) {
      setShowContactPanel(false);
      return;
    }
    setShowContactPanel(id);
  };

  const isActiveContactCheck = () => {
    if (activeContact === id) {
      return true;
    }
    return false;
  };

  const panelRef = useRef();

  useEffect(() => {
    // Function to check if clicked outside of the panel
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Close the panel
        // For example, you might update a state to hide the panel
        setShowContactPanel(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelRef, setShowContactPanel]);

  useEffect(() => {
    socket.emit("find_last_message", room_id);
    socket.on("recieve_last_message", (message) => {
      if (message.room_id !== room_id) return;

      if (message.viewed === false && message.user.id !== userDetails.id) {
        setNewMessage(true);
      }

      const getMessageText = (message_text) => {
        let message = "";
        if (message_text.length === 0) {
          message = "No messages yet";
        } else if (message_text.length <= 20) {
          message = message_text;
        } else if (message_text.length > 20) {
          message = message_text.slice(0, 20) + "...";
        }
        return message;
      }
      const message_text = getMessageText(message.message);

      const getDate = (date) => {
        const now = new Date();
        const message_date = new Date(date);
        const diff = now - message_date;
        if (diff < 60000) {
          return "Just now";
        } else if (diff < 3600000) {
          return Math.floor(diff / 60000) + "m";
        }
        else if (diff < 86400000) {
          return Math.floor(diff / 3600000) + "h";
        } else if (diff < 604800000) {
          return Math.floor(diff / 86400000) + "d";
        } else if (diff < 2592000000) {
          return Math.floor(diff / 604800000) + "w";
        } else {
          return Math.floor(diff / 31536000000) + "y";
        }
      }

      const getUser = (message_user) => {
        if (message_user.id === userDetails.id) {
          return "You";
        } else {
          return message_user.username;
        }
      }
      const message_user = getUser(message.user);
      const message_time = getDate(message.created_at);

      setLastMessage({
        id: message.id,
        message: message_text,
        user: message_user,
        time: message_time,
        viewed: message.viewed,
      })
    })
  }, [room_id, socket]);


  const handleDeleteContact = () => {
    socket.emit("remove_contact", { room_id: room_id, user_id: userDetails.id });
  }

  useEffect(() => {
    socket.on("contact_removed", () => {
      location.reload();
    });
    return () => {
      socket.off("contact_removed");
    };
  }, [socket]);

  return (
    <div
      className={`flex items-center py-2 px-4  cursor-pointer  ${isActiveContactCheck()
        ? "dark:bg-lightDark dark:text-black  bg-gray-100"
        : "dark:hover:bg-lightDark hover:bg-gray-100"
        }`}
      onClick={handleClick}
    >
      <img
        src={profilePng}
        alt="Profile Image"
        className="w-10 h-10 rounded-full mr-4 flex-shrink-0"
        style={{ backgroundColor: profile_color }}

      />
      <div className="flex flex-col flex-grow">
        <p
          className={`text-base font-medium ${isActiveContactCheck()
            ? "dark:text-lightWhite text-dark"
            : "dark:text-lightWhite"
            }`}
        >
          {username}
        </p>
        {lastMessage.message ?
          <div className="flex items-center gap-2">

            <p className={`overflow-hidden ${newMessage ? 'font-extrabold' : ''} text-xs dark:text-customGray`}>{lastMessage.user + ': ' + lastMessage.message} <span className="text-gray-500 ml-1">{lastMessage.time}</span></p>
            {seenJSX()}
          </div>
          : <p className="text-xs dark:text-customGray">No messages yet</p>
        }

      </div>
      <div
        className="rounded-full bg-gray-300 dark:bg-customGray w-6 h-6 ml-auto flex justify-center items-center hover:bg-gray-400 dark:hover:bg-lightDark relative flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          handleShowPanel();
        }}
      >
        <SlOptions className=" text-black " />
        {showContactPanel === id && (
          <div
            className="absolute top-0 right-10  bg-white dark:bg-dark dark:border border-lightDark p-4 w-30 shadow flex flex-col justify-center items-center gap-2"
            ref={panelRef}
          >
            <button className="text-blue-500 hover:text-blue-700 dark:text-lightWhite dark:hover:text-gray-400">
              Option
            </button>
            <button className="text-blue-500 hover:text-blue-700 dark:text-lightWhite dark:hover:text-gray-400">
              Option
            </button>
            <button className="text-blue-500 hover:text-blue-700 dark:text-lightWhite dark:hover:text-gray-400">
              Option
            </button>
            <button className="text-red-500 hover:text-red-700" onClick={handleDeleteContact}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
