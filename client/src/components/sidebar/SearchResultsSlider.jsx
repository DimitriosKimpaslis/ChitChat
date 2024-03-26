import SearchResultContact from "./SearchResultContact";

const SearchResultSlider = ({
  searchResults,
  setForcedUpdate,
  setShowContactsOrSearchResults,
  setSearchQuery,
}) => {
  return (
    <div className="flex flex-col px-4 border-b border-gray-200 h-[72vh] overflow-y-scroll pt-3 flex-[20]">
      <p onClick={() => setShowContactsOrSearchResults("contacts")} className="text-blue-500 hover:text-blue-700 cursor-pointer w-fit">
        Back to Contacts
      </p>
      {searchResults.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No Results
        </p>
      )}
      {searchResults.map((user, key) => (
        <SearchResultContact
          key={key}
          id={user.id}
          username={user.username}
          profile_color={user.profile_color}
          setShowContactsOrSearchResults={setShowContactsOrSearchResults}
          setForcedUpdate={setForcedUpdate}
          setSearchQuery={setSearchQuery}
        />
      ))}
    </div>
  );
};

export default SearchResultSlider;
