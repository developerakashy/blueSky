import axios from "axios"
import { Ellipsis, UserRound } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useUser } from "../context/userContext"
import formatTimeLine from "../utils/formatTimeLine"

function ChatCard({chat, chatWithUser}){
    const {loading, setLoading, setChats} = useUser()
    const [chatMenu, setChatMenu] = useState(false)
    const navigate =  useNavigate()

    const redirectUserProfile = (e) => {
        e.stopPropagation()
        navigate(`/user/${chatWithUser?.username}`)
    }

    const handleDropDown = (e) => {
        e.stopPropagation()
        setChatMenu(prev => !prev)

    }

    const handleChatDelete = async (e) => {
        e.stopPropagation()
        if(loading) return
        setLoading(true)

        try {
            const [chatResponse, messagesResponse] = await Promise.all([
                axios.delete(`${import.meta.env.VITE_BACKEND_URL}/chat/${chat?._id}`, { withCredentials: true }),
                axios.delete(`${import.meta.env.VITE_BACKEND_URL}/chat/messages/${chat?._id}`, { withCredentials: true })
            ]);

            console.log(chatResponse.data, messagesResponse.data);

            toast.success("Chat deleted");
            setChatMenu(false)
            setChats(prev => prev.filter(chatInfo => chatInfo?._id !== chat?._id))

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'error deleting chat')
        } finally{
            setLoading(false)
        }
    }

    const handleConversationDelete = async (e) => {
        e.stopPropagation()
        if(loading) return
        setLoading(true)

        try {
            const {data} = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/chat/messages/${chat?._id}`, {withCredentials: true})
            console.log(data)
            chat.lastMessage = ''
            toast.success('Messages deleted')
            setChatMenu(false)

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'error deleting chat')
        } finally{
            setLoading(false)
        }
    }


    return(
        <div className="relative">
            <div key={chat?._id} onClick={() => navigate(`messages/${chat?._id}`)} className="w-full cursor-pointer flex gap-2.5 items-center p-4 border-b border-slate-200 hover:bg-gray-50">
                <div className="min-w-12">
                    {!chatWithUser?.avatar ?
                        <div onClick={(e) => redirectUserProfile(e)} className='h-10 w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                            <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                        </div> :

                        <img onClick={(e) => redirectUserProfile(e)} className='h-10 w-10 rounded-full object-cover' src={chatWithUser?.avatar} alt="" />
                    }
                    </div>

                <div className="relative w-full">
                    <div className="flex justify-between items-center">
                        <div onClick={(e) => redirectUserProfile(e)} className="flex items-center h-5 gap-[3px]">
                            <p className="font-semibold text-[15px] hover:underline">{chatWithUser?.fullname.toUpperCase()}</p>
                            <p className="pb-2 text-[15px]">.</p>
                            <p className="text-gray-600 text-[15px]">@{chatWithUser?.username}</p>
                        </div>

                        <div className="absolute right-0 flex flex-col items-end">
                            <Ellipsis className="min-h-8 min-w-8 p-2 rounded-full stroke-slate-600 hover:bg-blue-500/20 hover:stroke-blue-500 cursor-pointer " onClick={(e) => handleDropDown(e)}/>
                        </div>

                    </div>

                    <div className="flex justify-between items-center min-h-5">
                        <p className="">{chat?.lastMessage || ''}</p>
                        <p className="text-xs px-2 text-gray-800">{chat?.lastMessage ? formatTimeLine(chat?.lastMessageCreatedAt) : ''}</p>
                    </div>
                </div>
            </div>

            {chatMenu  &&
                <>
                    <div onClick={() => setChatMenu(false)} className="fixed top-0 bottom-0 right-0 left-0 w-full z-10 flex flex-col bg-transparent border-[1px]"/>
                    <div  className="absolute right-3 flex flex-col items-start bg-white top-3 border border-slate-200 rounded-xl z-10 overflow-hidden">
                        <button onClick={(e) => handleConversationDelete(e)} className="cursor-pointer text-nowrap px-4 text-start w-full py-2 text-red-500 hover:bg-red-50">Delete all messages for me</button>
                        <button onClick={(e) => handleChatDelete(e)} className="cursor-pointer text-nowrap px-4 text-start w-full py-2 text-red-500 hover:bg-red-50">Delete chat for me</button>
                    </div>
                </>
            }
        </div>
    )
}

export default ChatCard
