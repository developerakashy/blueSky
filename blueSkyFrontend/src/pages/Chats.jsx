import axios from "axios"
import React, { useEffect, useMemo, useState } from "react"
import { useUser } from "../context/userContext"
import { useNavigate } from "react-router-dom"
import ChatCard from "../components/ChatCard"
import { toast } from "react-toastify"
import debounce from "../utils/debounce"
import UserCard from "../components/UserCard"
import { UserRound, X } from "lucide-react"

function Chats(){
    const {user, setChats, chats} = useUser()
    const navigate =  useNavigate()
    const [users, setUsers] = useState([])
    const [newChat, setNewChat] = useState(false)

    const [searchStr, setSearchStr] = useState('')
    const [showSuggestion, setShowSuggestion] = useState(false)


    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat`, {withCredentials: true})
                setChats(data.data)

            } catch (error) {
                console.log(error)
            }
        }

        fetchChats()
    }, [])


    const createChat = async (userId) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat`, {userId}, {withCredentials: true})
            console.log(data)
            navigate(`messages/${data.data._id}`)
        } catch (error) {
            console.log(error)
        }
    }


    const fetchUsers = async (searchStr) => {

        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/all?search=${searchStr}`)
            console.log(data?.data)
            setUsers(data?.data)

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setTimeout(() => {

            }, 500)
        }
    }

    const debounceGetUser = useMemo(() => debounce(() => fetchUsers(searchStr), 500), [searchStr])

    useEffect(() => {
        if(searchStr?.trim()){
            debounceGetUser()
        }

        if(!searchStr?.trim()){
            setUsers([])
        }

        return () => {
            debounceGetUser.cancel()
        }

    }, [searchStr, debounceGetUser])

    return(
        <div className="relative w-full">
        <div className="w-full pb-186">
            <div className="flex z-10 sticky top-0 bg-white/70 backdrop-blur-sm justify-between items-center py-3 px-4 border-b border-slate-200">
                <p className="text-xl font-bold">Chats</p>
                <button onClick={() => setNewChat(true)} className="cursor-pointer block flex items-center bg-blue-500 text-white px-3 py-1 rounded-xl gap-2">New chat</button>
            </div>

            {chats && chats.map(chat => {
                const chatWithUser = chat.users[0]?._id === user?._id ? chat.users[1] : chat.users[0]
                return (
                    <ChatCard key={chat?._id} chat={chat} chatWithUser={chatWithUser}/>
                )
            })}


        </div>

        {newChat &&
            <div className="absolute z-20 top-0 backdrop-blur-xs h-full  w-full h-12 flex flex-col items-center">
                <X strokeWidth={2.5} onClick={() => setNewChat(false)} className="cursor-pointer absolute left-3 top-3 p-1 rounded-full stroke-slate-700 bg-black stroke-white hover:bg-red-500 h-6 w-6"/>
                <div className="mt-12 border border-slate-200 rounded-full bg-white w-[75%] py-4 px-6">
                    <input
                        type="text"
                        onChange={(e) => setSearchStr(e.target.value)}
                        placeholder="search username"
                        className="p-2 rounded-xl w-full focus:outline-slate-400 outline-slate-200 outline-1"
                    />
                </div>

                {users.length > 0 &&
                    <div className="border border-slate-200 h-12 w-96 mt-4 bg-white max-h-96 h-fit rounded-xl overflow-y-auto">

                        {users.map(chatUser => chatUser?._id !== user?._id &&
                            <div key={chatUser?._id} onClick={() => createChat(chatUser?._id)} className="cursor-pointer hover:bg-gray-50 flex gap-2 px-4 py-2 border-b border-slate-200">
                                {!chatUser?.avatar ?
                                    <div className='h-12 w-12 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                                        <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                                    </div> :

                                    // <img className='h-12 w-12 rounded-full object-cover' src={user?.avatar} alt="" />
                                    <img className="h-12 w-12 rounded-full object-cover" src={chatUser?.avatar} alt="" />
                                }
                                <div>
                                    <p>{chatUser?.fullname?.toUpperCase()}</p>
                                    <p className="text-blue-500 font-semibold">@{chatUser?.username}</p>
                                </div>
                            </div>

                        )}

                    </div>
                }
            </div>
        }

        </div>
    )
}

export default Chats
