import React, { useState } from "react";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { Heart, UserRound } from "lucide-react";

function NotificationCard({notification}){
    const navigate = useNavigate()

    const handleUserClick = (e, username) => {
        e.stopPropagation()
        navigate(`/user/${username}`)

    }

    return(
        <div className="">
            {notification.type === 'reply' &&
                <PostCard repliedTo={notification?.receiverUserId?.username} post={notification?.postReplyId}/>
            }

            {notification.type === 'like' &&
            <div onClick={() => navigate(`/post/${notification?.relatedPostId?._id}`)} className="cursor-pointer border-b border-slate-200 flex gap-2 px-2 py-2 hover:bg-slate-50">
                <div className="min-w-12 flex justify-center">
                    <Heart className="h-7.5 w-7.5 fill-red-500 stroke-red-500"/>
                </div>

                <div>
                {!notification?.senderUserId?.avatar ?
                    <div className='h-10 w-10 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                        <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                    </div> :

                    <img className='h-10 w-10 rounded-full object-cover' src={notification?.senderUserId?.avatar} alt="" />
                }
                    <p onClick={(e) => handleUserClick(e, notification?.senderUserId?.username)} className="text-[15px] mt-2"><span className="font-bold hover:underline">{notification?.senderUserId?.fullname?.toUpperCase()}</span> liked your post</p>
                    <p className="text-gray-600 text-[15px] mt-2">{notification?.relatedPostId?.text}</p>
                </div>
            </div>
            }

            {notification.type === 'mention' &&
                <PostCard post={notification?.relatedPostId}/>
            }



            <div>

            </div>
        </div>
    )
}

export default NotificationCard
