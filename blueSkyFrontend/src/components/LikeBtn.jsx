import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import { Heart } from "lucide-react";

function Like({post}){
    const {user: loggedInUser} = useUser()
    const [postLikeCount, setPostLikeCount] = useState(post?.likeCount || 0)
    const [postLiked, setPostLiked] = useState(post?.userLiked)
    let likeTimeoutRef = useRef(null)
    let wasPostLikedRef = useRef(post?.userLiked)

    const handlePostLike = (e) => {
        e.stopPropagation()
        if(!loggedInUser?._id) {
            toast.error('Log in to like the post')
            return
        }

        if(likeTimeoutRef.current){
            clearTimeout(likeTimeoutRef.current)
        }

        setPostLikeCount(prev => postLiked ? prev - 1 : prev + 1)
        setPostLiked(prev => !prev)

    }

    useEffect(() => {
        const togglePostLike = async () => {
            try {
                const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/like/${post._id}`, {}, {withCredentials: true})

                return data?.data?.userIdArray?.length
            } catch (error) {
                console.log(error)
                setPostLikeCount(post.likeCount)
            }
        }

        likeTimeoutRef.current = setTimeout(async () => {
            if(postLiked !== wasPostLikedRef.current){
                console.log('request sent')
                const result = await togglePostLike()
                wasPostLikedRef.current = postLiked
                setPostLiked(postLiked)
                setPostLikeCount(result)

            }
        }, 500)

        return () => {
            if(likeTimeoutRef.current){
                clearTimeout(likeTimeoutRef.current)
            }
        }

    }, [postLiked])

    return(
        <button onClick={(e) => handlePostLike(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
            <div className="p-2 group-hover:bg-red-100/60 transition-colors duration-200 rounded-full">
                <Heart strokeWidth={2} className={`h-4 w-4 stroke-gray-500 group-hover:stroke-red-400 ${postLiked ? 'fill-red-400 stroke-red-400' : ''}`}/>
            </div>
            <p className={`pt-[3px] font-medium group-hover:text-red-400 ml-[-5px] ${postLiked ? 'text-red-400' : ''}`}>{postLikeCount}</p>
        </button>
    )
}

export default Like
