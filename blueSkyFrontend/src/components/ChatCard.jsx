import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router"

function ChatCard({chat, chatWithUser}){
    const [chatMenu, setChatMenu] = useState(false)
    const navigate =  useNavigate()


    const handleDropDown = (e) => {
        e.stopPropagation()
        setChatMenu(prev => !prev)

    }

    const handleChatDelete = async (e) => {
        e.stopPropagation()

        try {
            const { data } = await axios.delete(`http://localhost:8003/chat/${chat?._id}`,{withCredentials: true})
            console.log(data)

        } catch (error) {
            console.log(error)
        }
    }

    const handleConversationDelete = async (e) => {
        e.stopPropagation()

        try {
            const {data} = await axios.delete(`http://localhost:8003/chat/messages/${chat?._id}`, {withCredentials: true})
            console.log(data)
            chat.lastMessage = ''
        } catch (error) {
            console.log(error)
        }
    }


    return(
        <div key={chat?._id} onClick={() => navigate(`messages/${chat?._id}`)} className="cursor-pointer flex gap-2.5 items-center p-4 border-b-[1px] hover:bg-gray-50">
            <div className="min-w-12">
                <img className="h-12 w-12 rounded-full object-cover" src={chatWithUser?.avatar} alt="" />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div className="flex items-center h-5 gap-[3px]">
                        <p className="font-semibold text-[15px]">{chatWithUser?.fullname.toUpperCase()}</p>
                        <p className="pb-2 text-[15px]">.</p>
                        <p className="text-gray-600 text-[15px]">@{chatWithUser?.username}</p>
                    </div>

                    <div className="relative flex flex-col items-end">
                        <button onClick={(e) => handleDropDown(e)} className=''>⋯</button>
                        {chatMenu  &&
                        <div  className="absolute flex flex-col items-start bg-white top-7 border-[1px] rounded-xl overflow-hidden">
                            <button onClick={(e) => handleConversationDelete(e)} className="text-nowrap px-4 text-start w-full py-1 border-b-[1px] text-red-500 hover:bg-red-50">Delete conversation for you</button>
                            <button onClick={(e) => handleChatDelete(e)} className="text-nowrap px-4 text-start w-full py-1 border-b-[1px] text-red-500 hover:bg-red-50">Delete chat for you</button>
                        </div>
                        }
                    </div>

                </div>

                <p className="text-gray-900 h-6">{chat?.lastMessage || ''}</p>
            </div>
        </div>
    )
}

export default ChatCard
