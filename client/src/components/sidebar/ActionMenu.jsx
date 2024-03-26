
import { Tooltip } from '@mui/material';
import { HiOutlineLogout } from "react-icons/hi";
import { SocketContext } from '../Top';
import { useContext } from 'react';
import { RiArchive2Line } from "react-icons/ri";
import { BiSupport } from "react-icons/bi";
import { HttpEndpoint } from "../Top";
import { HttpsEndpoint } from "../Top";



const ActionMenu = () => {
    const { HTTPSendpoint } = useContext(HttpsEndpoint);
    const { HTTPendpoint } = useContext(HttpEndpoint);
    const { socket } = useContext(SocketContext);

    const logout = async () => {
        try {
            const res = await fetch("http://messagingclientchitchat.gr/api/logout", {
                method: "GET",
                credentials: "include",
            });
            if (res.status === 200) {
                window.location.href = "/auth/login";
            }
        } catch (error) {
            console.error(error);
        }
    };

    const findAllUsers = async () => {
        socket.emit("return_all_users");
    }

    return (
        <div className='h-[8vh] dark:bg-lightDark bg-white flex-[2] '>
            <div className='flex justify-around items-center h-full'>
                <Tooltip title="Logout">
                    <div>
                        <HiOutlineLogout className='text-red-500 text-2xl hover:text-red-700 cursor-pointer' onClick={logout} size={23} />
                    </div>
                </Tooltip>

                <Tooltip title="Archive">
                    <div>
                        <RiArchive2Line className='text-gray-500 dark:hover:text-gray-400 dark:text-lightWhite text-2xl hover:text-gray-200 cursor-pointer' onClick={findAllUsers} size={23} />
                    </div>
                </Tooltip>

                <Tooltip title="Technical Support">
                    <div>
                        <BiSupport className='text-gray-500 dark:hover:text-gray-400 dark:text-lightWhite text-2xl hover:text-gray-200 cursor-pointer' size={23} onClick={() => window.location.href = "mailto:dimitrioskimpaslis@gmail.com?subject=messaging app contact button&body="} />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

export default ActionMenu