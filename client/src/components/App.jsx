import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import dragIcon from "../assets/drag-handle.svg";
import { CircularProgress } from "@mui/material";
import { HttpEndpoint } from "./Top";
import { HttpsEndpoint } from "./Top";


export const LightPrefer = createContext();
export const UserDetails = createContext();
export const ChatLoader = createContext();

const App = () => {
  const [sidebarWidth, setSidebarWidth] = useState(400); // Initial sidebar width
  const isResizing = useRef(false);


  const { HTTPSendpoint } = useContext(HttpsEndpoint);
  const { HTTPendpoint } = useContext(HttpEndpoint);


  const startResizing = useCallback((mouseDownEvent) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleResizing);
    document.addEventListener("mouseup", stopResizing);
    mouseDownEvent.preventDefault();
  }, []);

  const handleResizing = useCallback((mouseMoveEvent) => {
    if (!isResizing.current) return;
    setSidebarWidth(mouseMoveEvent.clientX);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleResizing);
    document.removeEventListener("mouseup", stopResizing);
  }, [handleResizing]);

  const [lightPrefer, setLightPrefer] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [chatLoader, setChatLoader] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userThemePreference = localStorage.getItem("theme");
    const systemThemePreference = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (userThemePreference) {
      setLightPrefer(userThemePreference);
      if (userThemePreference === "dark") {
        localStorage.setItem("theme", "dark");
        document.body.classList.add("dark");
      } else {
        localStorage.setItem("theme", "light");
        document.body.classList.remove("dark");
      }
    } else if (systemThemePreference) {
      setLightPrefer(systemThemePreference);
      if (systemThemePreference === "dark") {
        localStorage.setItem("theme", "light");
        document.body.classList.remove("dark");
      } else {
        localStorage.setItem("theme", "dark");
        document.body.classList.add("dark");
      }
    } else {
      setLightPrefer("light");
    }
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await fetch("http://messagingclientchitchat.gr/api/user_details", {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 200) {
          const data = await res.json();
          console.log(data)
          setUserDetails(data);
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error("Error getting user details", error);
      }
    }
    getUserDetails();
  }, []);

  return (
    <LightPrefer.Provider value={{ lightPrefer, setLightPrefer }}>
      <UserDetails.Provider value={{ userDetails, setUserDetails }}>
        <ChatLoader.Provider value={{ chatLoader, setChatLoader }}>
          {loading ? <div className="h-full w-full flex justify-center items-center absolute">
            <CircularProgress />
          </div> :
            <div className="border border-black w-full h-[100vh] overflow-hidden flex">
              <Sidebar sidebarWidth={sidebarWidth} />
              <div
                id="resizer"
                className="cursor-col-resize w-4 bg-gray-100 dark:bg-[#424242] flex justify-center items-center "
                onMouseDown={startResizing}
              >
                <img src={dragIcon} alt="Drag Icon" className="w-50 h-50" />
              </div>
              <Outlet />
            </div>
          }
        </ChatLoader.Provider>
      </UserDetails.Provider>
    </LightPrefer.Provider>
  );
};

export default App;
