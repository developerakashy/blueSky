import React, { useState } from "react";
import PostCard from "./PostCard";
import usePosts from "../hooks/usePosts";
import { usePostContext } from "../context/postContext";
import { useUser } from "../context/userContext";

function NotificationCard(){
    const [] = useState()
    const {user} = useUser()
    const post = {
        "_id": "678637a5f13c858e4bddb26b",
        "text": "text related to post ",
        "mediaFiles": [
            "http://res.cloudinary.com/donntefzc/image/upload/v1736849315/wsr9efhdm9eiwmfkm4hj.png",
            "http://res.cloudinary.com/donntefzc/image/upload/v1736849315/hmi19fjw1mrntxqavjiv.png",
            "http://res.cloudinary.com/donntefzc/image/upload/v1736849316/a3a92j2corso7ap2devn.png"
        ],
        "userId": {
            "_id": "6783e4159d2bc5d54cd509f6",
            "fullname": "AKASH YADAV",
            "username": "akash",
            "email": "akash@ex.com",
            "avatar": "http://res.cloudinary.com/donntefzc/image/upload/v1736837495/gkbpz5islze9bxtvgeoc.png",
            "coverImage": "http://res.cloudinary.com/donntefzc/image/upload/v1737528772/epbjwxhxjytqlsbakvz9.png",
            "isVerified": false,
            "createdAt": "2025-01-12T15:47:33.081Z",
            "updatedAt": "2025-01-24T11:37:46.010Z",
            "about": "MERN stack web developer"
        },
        "parentPost": null,
        "isPublic": true,
        "createdAt": "2025-01-14T10:08:37.249Z",
        "updatedAt": "2025-01-14T10:08:37.249Z",
        "replyCount": 15,
        "likeCount": 3,
        "userLiked": true
    }


    return(
        <div className="">
            <div>
                <PostCard repliedTo={'akash'} post={post}/>
            </div>

            <div className="border-2 flex gap-2 px-4 py-3">
                <div className=" min-w-12 flex justify-center">
                    <img className="mt-1 h-7 w-7" src="../../public/heart.png" alt="" />
                </div>

                <div>
                    <img className="h-10 w-10 object-cover rounded-full" src={user?.avatar} alt="" />
                    <p className="text-[15px] mt-2"><span className="font-bold">{user?.fullname}</span> liked your post</p>
                    <p className="text-gray-600 text-[15px]">{post?.text}</p>
                </div>
            </div>

            <div>

            </div>
        </div>
    )
}

export default NotificationCard
