import React, { useState } from "react";
import PostCard from "./PostCard";
import usePosts from "../hooks/usePosts";
import { usePostContext } from "../context/postContext";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router";

function NotificationCard({notification}){
    const navigate = useNavigate()

    return(
        <div className="">
            {notification.type === 'reply' &&
                <PostCard repliedTo={notification?.receiverUserId?.username} post={notification?.postReplyId}/>
            }

            {notification.type === 'like' &&
                <div onClick={() => navigate(`/post/${notification?.relatedPostId?._id}`)} className="cursor-pointer border-b-[1px] flex gap-2 px-4 py-3 hover:bg-slate-50">
                <div className=" min-w-12 flex justify-center">
                    <img className="mt-1 h-7 w-7" src="../../heart.png" alt="" />
                </div>

                <div>
                    <img className="h-10 w-10 object-cover rounded-full" src={notification?.senderUserId?.avatar} alt="" />
                    <p className="text-[15px] mt-2"><span className="font-bold">{notification?.senderUserId?.fullname?.toUpperCase()}</span> liked your post</p>
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
