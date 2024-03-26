import { useContext, useEffect, useRef, useState } from "react";
import ActionMenu from "./ActionMenu";
import Searchbar from "./Searchbar";
import SidebarHeader from "./SidebarHeader";
import { SocketContext } from "../Top";
import ContactsSlider from "./ContactsSlider";
import SearchResultSlider from "./SearchResultsSlider";

const Sidebar = ({ sidebarWidth }) => {
  const [contacts, setContacts] = useState([]); // [1]
  const [searchResults, setSearchResults] = useState([]); // [1]
  const [searchQuery, setSearchQuery] = useState(""); // [1]
  const [showContactsOrSearchResults, setShowContactsOrSearchResults] =
    useState("contacts"); // [1]
  
  const [forcedUpdate, setForcedUpdate] = useState(0);

  const { socket } = useContext(SocketContext); // [2]


  useEffect(() => {

    socket.on("contacts", (contacts) => {
      console.log('contacts', contacts)
      setContacts(contacts);
    });

    return () => {
      socket.off("contacts");
    };
  }, []);

  useEffect(() => {
    socket.emit("find_contacts");
  }, [socket, forcedUpdate]);

  useEffect(() => {
    socket.on("user_found", (data) => {
      setSearchResults(data);
    });
    return () => {
      socket.off("user_found");
    };
  }, []);

  const [showContactPanel, setShowContactPanel] = useState(null);

  return (
    <div
      
      className="bg-gray-200 dark:bg-dark flex flex-col h-[100vh] min-w-[300px] max-w-[600px]"
      style={{ width: `${sidebarWidth}px` }}
      id="sidebar"
    >
      <SidebarHeader />
      <Searchbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setShowContactsOrSearchResults={setShowContactsOrSearchResults}
      />

      {showContactsOrSearchResults === "contacts" ? (
        <ContactsSlider
          contacts={contacts}
          setContacts={setContacts}
          showContactPanel={showContactPanel}
          setShowContactPanel={setShowContactPanel}
        />
      ) : (
        <SearchResultSlider
          searchResults={searchResults}
          setSearchResults={setSearchResults}
            setShowContactsOrSearchResults={setShowContactsOrSearchResults}
            setForcedUpdate={setForcedUpdate}
            setSearchQuery={setSearchQuery}
        />
      )}

      <ActionMenu />
    </div>
  );
};

export default Sidebar;
