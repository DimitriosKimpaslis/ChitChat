import { useContext, useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import { useLocation } from "react-router-dom";
// import { messages } from "../../mockData";
import UserMessage from "./UserMessage";
import ForeignMessage from "./ForeignMessage";
import NewMessageBar from "./NewMessageBar";
import { SocketContext } from "../Top";
import { ChatLoader, LightPrefer } from "../App";
import { UserDetails } from "../App";
import groupChat from '../../assets/gch.png'
import { CircularProgress } from "@mui/material";

const Chat = () => {

  const [room_name, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  //so that i calculate what messages to send
  const [messagesPage, setMessagesPage] = useState()
  const [reachedStartOfChat, setReachedStartOfChat] = useState(false)
  const [loadMore, setLoadMore] = useState(false)
  const [topElement, setTopElement] = useState()
  const [chatHeader, setChatHeader] = useState({
    room_name: "",
    profile_color: "",
  })

  const { userDetails } = useContext(UserDetails);
  const { socket } = useContext(SocketContext);
  const { chatLoader, setChatLoader } = useContext(ChatLoader);
  const {lightPrefer} = useContext(LightPrefer)


  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = bottomRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    const threshold = 10; // Adjust this threshold as needed

    if (scrollBottom < threshold) {
      scrollToBottom();
    }
  };

  useEffect(() => {

    //if the location changes, clear the messages state since it will be a new chat and the messages will be fetched from the server on mount
    setChatHeader({
      room_name: "",
      profile_color: ""
    })
    setMessagesPage(1)
    setChatLoader(true)
    setReachedStartOfChat(false)
    setMessages([]);

    socket.emit('find_room_messages_and_users', urlParams.get("room_id"));

    let room_id = urlParams.get("room_id");
    setRoomName(room_id);
    //in case the user refreshes the page, the socket will not be connected to the room {maybe}
    socket.emit('join_room', room_id);

    const handleIncomingMessage = (message) => {
      //if the message is not from the current room, return
      if (message.room_id !== room_id) return;
      setMessages((messages) => [...messages, message]);
      setTimeout(() => {
        handleScroll();
      }
        , 100);
    };

    //for new messages sent now
    socket.on("receive_message", handleIncomingMessage);

    //for first render
    socket.on('recieve_room_messages_and_users', (messages_and_users) => {
      if (messages_and_users.messages.length < 10) {
        setReachedStartOfChat(true)
      }
      const invertedMessages = [...messages_and_users.messages]
      invertedMessages.reverse()
      setMessages(invertedMessages);
      setUsers(messages_and_users.users)
      setChatLoader(false)
      setTimeout(() => {
        scrollToBottom()
      }, 200);
      //i dont use state becuase there is a race condition
      if (messages_and_users.room_id.includes('pv') === true) {
        setChatHeader({
          room_name: messages_and_users.users[0].username,
          profile_color: messages_and_users.users[0].profile_color
        })
      } else {
        console.log("group chat")
      }
    });

    socket.on('load_more_messages', (res) => {
      setLoadMore(false)
      if (res.length < 10) {
        setReachedStartOfChat(true)
        return
      }
      const invertedMessages = [...res]
      invertedMessages.reverse()
      setMessages((messages) => [...invertedMessages, ...messages]);
    });

    return () => {
      socket.off('load_more_messages');
      socket.off('find_room_messages_and_users');
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [location, socket]);

  const loadMoreMessages = () => {
    socket.emit('load_more_messages', { room_name, messagesPage, users });
    setLoadMore(true)
    setMessagesPage(messagesPage + 1)
  }

  const TopElementOfChat = () => {
    if (messages.length === 0 && room_name !== null) {
      return <p className="text-center dark:text-lightWhite">No Messages</p>
    }
    else if (reachedStartOfChat && messages.length > 0) {
      return <p className="text-center dark:text-lightWhite">This is the start of your chat</p>
    }
    else if (loadMore) {
      return (
        <div className="text-center">
          <CircularProgress />
        </div>
      )
    }
    else {
      return <button onClick={() => {
        loadMoreMessages()
      }} id="loadMoreButton" className="dark:text-lightWhite dark:hover:text-gray-400 hover:text-customGray">Load More</button>
    }
  }
  
  useEffect(() => {
    setTopElement(TopElementOfChat())
  }, [messages, reachedStartOfChat, loadMore])

  return (
    <div className="flex-grow bg-white dark:bg-lightDark flex flex-col h-[100vh] relative">
      {room_name === null && <img src={groupChat} alt="pattern" className="w-full h-full object-contain" />}

      {(room_name === null) ? null : <ChatHeader info={chatHeader} />}
      {(!chatLoader && room_name !== null) ?
        < div className={`flex flex-col overflow-y-auto h-[85vh] px-4 py-4 bg- dark:bg-lightDark gap-1 dark:[color-scheme:dark]`}>

          {topElement}

          {messages.map((message, key) => {
            if (message.user_id === userDetails.id) {
              return (
                <UserMessage
                  key={key}
                  message={message.message}
                  time={message.created_at}
                />
              );
            } else {
              return (
                <ForeignMessage
                  key={key}
                  message={message.message}
                  time={message.created_at}
                  sender={message.user}
                />
              );
            }
          })}
          <div ref={bottomRef}></div>
        </div> :
        (room_name === null) ? null : <div className="overflow-y-auto h-[85vh] flex justify-center items-center">
          <CircularProgress />
        </div>

        // <div className="overflow-y-auto h-[85vh] flex justify-center items-center">
        //   <CircularProgress />
        // </div>
      }
      <NewMessageBar socket={socket} room_name={room_name} user_id={UserDetails.id} setMessages={setMessages} scrollToBottom={scrollToBottom} />
    </div >
  );
};

export default Chat;