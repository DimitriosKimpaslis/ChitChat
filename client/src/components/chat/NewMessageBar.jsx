
import { FaPaperPlane } from "react-icons/fa";
import { useContext, useState } from "react";
import { UserDetails } from "../App";

const NewMessageBar = ({ socket, room_name, setMessages, scrollToBottom }) => {
  const room_id = room_name; // [1]
  //since the server will not send the message back to the sender, we need to add the message to the state of the sender
  const [message, setMessage] = useState(""); // [1]
  const { userDetails } = useContext(UserDetails); // [1]
  const user_id = userDetails.id; // [1]


  const sendMessage = (event) => {
    event.preventDefault();
    if (message === "") return;
    const messageObject = {
      room_id,
      user_id,
      message,
      created_at: new Date(),
    };
    socket.emit("send_message", messageObject); // [4]
    setMessages((messages) => [...messages, messageObject]); // [3]
    //a little delay to make sure the message is added to the state before scrolling to the bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    setMessage(""); // [5]
  }

  return (
  <>
      {(room_id === null) ? null :
      
      <form className="h-[7vh] bg-gray-200 dark:bg-dark flex items-center px-8 pt-2 pb-3 gap-10" onSubmit={(e) => sendMessage(e)}>
        <input
          className="rounded-lg flex-grow p-4 h-[50%] dark:bg-dark dark:text-white bg-gray-200 border-b-2 border-customGray focus:outline-none focus:border-customBlue dark:focus:border-customBlue dark:placeholder-white"
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)} // [2]
        />
        <button className="flex hover:text-gray-500 dark:text-white dark:hover:text-gray-700" >
          Send <FaPaperPlane className="ml-2" />
        </button>
        </form>}</>
  );
};

export default NewMessageBar;
