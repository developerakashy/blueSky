import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/userContext";
import formatDate from "../utils/formatDate";
import formatTime from "../utils/formatTime";
import { UserRound } from "lucide-react";
import { ring } from 'ldrs'

ring.register()




function ChatMessages(){
    const navigate = useNavigate()
    const { chatId } = useParams()
    const {user, setMessages, messages} = useUser()
    const [receiver, setReceiver] = useState({})
    const [msgText, setMsgText] = useState('')
    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: "end" });
    };

    useEffect(() => {
        scrollToBottom();

    }, [messages]);


    useState(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/messages/${chatId}`, {withCredentials: true})
                console.log(data)
                setMessages(data?.data?.messages)
                setReceiver(data?.data?.chatWithUser)

            } catch (error) {
                console.log(error)
            }
        }

        fetchMessages()

    }, [chatId])

    const handleSendMessage = async () => {
        if(!msgText?.trim() || loading) return
        setLoading(true)

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/message`,
                {
                    receiverUserId: receiver?._id,
                    message: msgText
                },
                {withCredentials: true}
            )

            console.log(data)
            setMessages(prev => [...prev, data.data])
            setMsgText('')
        } catch (error) {
            console.log(error)
        } finally {
            setTimeout(() => setLoading(false), 400)
        }
    }


    return(
        <div className="relative h-screen max-h-screen">

            <div className="flex gap-2 border-b border-slate-200 px-2 py-2 w-full bg-white max-h-[10%]">
                <div className="flex items-center justify-center">
                    <button onClick={() => navigate(-1)} className='cursor-pointer p-2 w-max backdrop-blur-md hover:bg-black/10 rounded-full rounded-full'><img className='h-4' src="../../.././back.png" alt="" /></button>
                </div>
                <div className="min-w-12">
                    {!receiver?.avatar ?
                        <div className='h-10 w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                            <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                        </div> :

                        <img className='h-10 w-10 rounded-full object-cover' src={receiver?.avatar} alt="" />
                    }
                </div>

                <div>
                    <p className="text-[15px] font-bold">{receiver?.fullname?.toUpperCase()}</p>
                    <p className="text-sm">@{receiver?.username}</p>
                </div>
            </div>


            <div  className="w-full flex flex-col gap-2 px-2 border-blue-400 max-h-[80%] md:max-h-[85.5%] overflow-y-auto">
                {messages && messages.map((message, index) =>
                    <div ref={messagesEndRef} key={message?._id} className={`mt-2 max-w-[50%] flex-col ${message?.senderUserId?._id === user?._id ? 'flex items-end self-end' : ''}`}>
                            <p className={`w-fit px-4 py-3 leading-5 rounded-t-3xl ${ message?.senderUserId?._id === user?._id ? 'rounded-l-3xl bg-blue-200': 'rounded-r-3xl bg-gray-100'}`}>{message.message}</p>
                            <p className={`mt-[1px] mb-1 text-xs text-gray-500 ${message?.senderUserId?._id === user?._id ? 'text-end mr-1' : 'text-start ml-1'}`}>{formatDate(message?.createdAt)}, {formatTime(message?.createdAt)}</p>
                    </div>
                )}

            </div>

            <div className="w-full bg-white border border-slate-200 px-4 py-2 absolute bottom-12 md:bottom-0 left-0 right-0 flex gap-2 justify-between items-center">
                <input
                    className="outline-1 outline-slate-200 focus:outline-slate-400 max-w-[90%] w-full h-10 text-lg px-3 rounded-2xl"
                    type="text"
                    value={msgText}
                    disabled={loading && true}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="start a new message"
                    ref={inputRef}
                />
                <button onClick={() => handleSendMessage()} className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-full flex">
                    {loading ?
                    <l-ring
                      size="20"
                      stroke="3"
                      bg-opacity="0"
                      speed="2"
                      color="white"
                    ></l-ring>:
                    'send'}
                </button>
            </div>
        </div>
    )
}

export default ChatMessages
