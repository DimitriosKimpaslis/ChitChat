import { SocketContext } from '../Top';
import Contact from './Contact';
import { useContext, useEffect, useState } from 'react';

const ContactsSlider = ({ contacts, setContacts, showContactPanel, setShowContactPanel }) => {
  const [activeContact, setActiveContact] = useState(null);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    // if a new message returns from the server, put the contact at the top of the list
    socket.on('update_contacts', (room_id) => {
      const tempContacts = [...contacts];
      const contact = tempContacts.find(contact => contact.room_id === room_id);
      const newContacts = tempContacts.filter(contact => contact.room_id !== room_id);
      newContacts.unshift(contact);
      console.log('newContacts', newContacts)
      setContacts(newContacts);
    })
    return () => {
      socket.off('update_contacts');
    }
  }
    , [socket, contacts]);


  return (
    <div className="flex flex-col px-4 border-b border-gray-200 h-[72vh] overflow-y-scroll dark:[color-scheme:dark] pt-3 flex-[20]">
      {contacts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No Contacts
        </p>
      )}
      {contacts.map((contact) => (
        <Contact
          room_id={contact.room_id}
          key={contact.id}
          id={contact.id}
          username={contact.username}
          profile_color={contact.profile_color}
          activeContact={activeContact}
          setActiveContact={setActiveContact}
          showContactPanel={showContactPanel}
          setShowContactPanel={setShowContactPanel}
          setContacts={setContacts}
        />
      ))}
    </div>
  );
};

export default ContactsSlider