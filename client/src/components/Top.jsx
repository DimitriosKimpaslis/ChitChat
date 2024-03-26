import { createContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Loader from "./Loading";
import "../index.css";

export const SocketContext = createContext();
export const HttpEndpoint = createContext();
export const HttpsEndpoint = createContext();

const Top = () => {
  const [socket, setSocket] = useState();
  const [globalLoading, setGlobalLoading] = useState(true);
  const [HTTPSendpoint, HTTPSsetEndpoint] = useState("https://messagingclientchitchat.gr/");
  const [HTTPendpoint, HTTPsetEndpoint] = useState("http://messagingclientchitchat.gr/");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        const res = await fetch("http://messagingclientchitchat.gr/api/auth", {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          console.log("Not authenticated");
          setGlobalLoading(false);
          navigate("/auth/login");
        } else {
          const socket = io("http://messagingclientchitchat.gr/", {
            autoConnect: false,
            withCredentials: true,
          });
          setSocket(socket);
          socket.connect();
          console.log(socket);
          setGlobalLoading(false);
          navigate("/messaging");
          socket.on("disconnect", () => {
            console.log("Disconnected from server, trying to reconnect");
            setTimeout(() => {
              socket.connect();
            }, 1000);
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    isAuthenticated();

  }, []);


  return (
    <HttpEndpoint.Provider value={HTTPendpoint}>
      <HttpsEndpoint.Provider value={HTTPSendpoint}>
        <SocketContext.Provider value={{ socket, setSocket }}>
          <div>{globalLoading ? <Loader /> : <Outlet />}</div>
        </SocketContext.Provider>
      </HttpsEndpoint.Provider>
    </HttpEndpoint.Provider>
  );
};

export default Top;
