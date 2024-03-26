import { useContext, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { SocketContext } from "../Top";

const Searchbar = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  setShowContactsOrSearchResults,
}) => {
  const debounceDelay = 1000; // Adjust the debounce delay in milliseconds
  let debounceTimer;
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    // Clear the debounce timer whenever the input changes
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (searchQuery === "") {
        return;
      }
      socket.emit("search_user", searchQuery);
      setShowContactsOrSearchResults("searchResults");
    }, debounceDelay);

    // Cleanup function to clear the timeout on unmount
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  useEffect(() => {
    socket.on("return_all_users", (users) => {
      setSearchResults(users);
      setShowContactsOrSearchResults("searchResults");
    });
    return () => {
      socket.off("return_all_users");
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-[5vh] flex-[1]">
      <div className="flex items-center justify-center w-11/12 h-full bg-white dark:bg-dark border border-lightWhite rounded-full">
        <FaSearch className="ml-3 text-gray-500" />
        <input
          className="w-full h-full px-4 text-sm text-gray-700 rounded-full focus:outline-none dark:bg-dark dark:text-lightWhite dark:placeholder-lightWhite"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Searchbar;
