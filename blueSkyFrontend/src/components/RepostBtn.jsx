import axios from "axios"
import { Repeat2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useUser } from "../context/userContext"

function RepostBtn({post}){
    const {user: loggedInUser} = useUser()
    const [postRepostCount, setPostRepostCount] = useState(post?.repostCount || 0)
    const [postReposted, setPostReposted] = useState(post?.userReposted || false)
    let repostTimeoutRef = useRef(null)
    let wasPostRepostedRef = useRef(post?.userReposted || false)

    const handleRepost = (e) => {
        e.stopPropagation()
        if(!loggedInUser?._id) {
            toast.error('Log in to repost the post')
            return
        }

        if(repostTimeoutRef.current){
            clearTimeout(repostTimeoutRef.current)
        }

        setPostRepostCount(prev => postReposted ? prev - 1 : prev + 1)
        setPostReposted(prev => !prev)
    }

    useEffect(() => {
        const togglePostRepost = async () => {
            try {
                const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/repost/${post?._id}`, {}, {withCredentials: true})

                return data?.data?.repostCount || 0
            } catch (error) {
                console.log(error)
            }
        }

        repostTimeoutRef.current = setTimeout(async () => {
            if(postReposted !== wasPostRepostedRef.current){
                const repostCount = await togglePostRepost()
                wasPostRepostedRef.current = postReposted
                setPostRepostCount(repostCount)
                console.log('request send')
            }

        }, 700)

    }, [postReposted])


    return(
        <button onClick={(e) => handleRepost(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
            <div className="p-2 group-hover:bg-green-100/60 transition-colors duration-200 rounded-full">
                <Repeat2 strokeWidth={2} className={`h-4.5 w-4.5 stroke-gray-500 group-hover:stroke-green-500 ${postReposted ? 'stroke-green-500': ''}`}/>
            </div>
            <p className={`pt-[3px] font-medium group-hover:text-green-500 ml-[-5px] ${postReposted ? 'text-green-500': ''}`}>{postRepostCount}</p>
        </button>
    )
}

export default RepostBtn
