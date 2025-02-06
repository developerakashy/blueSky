import axios from "axios"
import React, { useEffect, useState } from "react"
import { useUser } from "../context/userContext"
import { useNavigate } from "react-router"
import ChatCard from "../components/ChatCard"

function Chats(){
    const {user, setChats, chats} = useUser()
    const navigate =  useNavigate()
    const [users, setUsers] = useState([])
    const [newChat, setNewChat] = useState(false)


    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await axios.get(`http://localhost:8003/chat`, {withCredentials: true})
                setChats(data.data)

            } catch (error) {
                console.log(error)
            }
        }

        fetchChats()
    }, [])


    const createChat = async (userId) => {
        try {
            const { data } = await axios.post(`http://localhost:8003/chat`, {userId}, {withCredentials: true})
            console.log(data)
            navigate(`messages/${data.data._id}`)
        } catch (error) {
            console.log(error)
        }
    }

    const handleNewChatBtn = async () => {
        setNewChat(true)
        try {
            const { data } = await axios.get('http://localhost:8003/user/all')
            setUsers(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <>
        <div className="w-[600px] border-x-[1px]">
            <div className="flex justify-between p-4 border-b-[1px]">
                <p className="text-xl font-bold">Chats</p>
                <button onClick={handleNewChatBtn} className="block flex items-center bg-blue-200 px-2 py-1 rounded-xl gap-2"><img className="w-3 h-3" src="../../plus.png" alt="" />New chat</button>
            </div>

            {chats && chats.map(chat => {
                const chatWithUser = chat.users[0]?._id === user?._id ? chat.users[1] : chat.users[0]
                return (
                    <ChatCard key={chat?._id} chat={chat} chatWithUser={chatWithUser}/>
                )
            })}


        </div>

        {newChat &&
            <div className="absolute top-12 bg-white border-2">
                {users.map(chatUser => chatUser?._id !== user?._id &&
                    <div key={chatUser?._id} onClick={() => createChat(chatUser?._id)} className="cursor-pointer hover:bg-gray-50 flex gap-2 px-4 py-2 border-b-[1px]">
                        <img className="h-12 w-12 rounded-full object-cover" src={chatUser?.avatar} alt="" />
                        <div>
                            <p>{chatUser?.fullname?.toUpperCase()}</p>
                            <p>@{chatUser?.username}</p>
                        </div>
                    </div>

                )}
            </div>
        }
        </>
    )
}

export default Chats
