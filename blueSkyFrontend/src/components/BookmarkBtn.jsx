import axios from "axios"
import { Bookmark } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useUser } from "../context/userContext"

function BookmarkBtn({post}){
    const {user:loggedInUser} = useUser()
    const [postBookmarked, setPostBookmarked] = useState(post?.userBookmarked || false)
    let bookmarkTimeoutRef = useRef(null)
    let wasPostBookmarkedRef = useRef(post?.userBookmarked || false)

    const handleBookmark = (e) => {
        e.stopPropagation()
        if(!loggedInUser?._id) {
            toast.error('Log in to bookmark the post')
            return
        }

        if(bookmarkTimeoutRef.current){
            clearTimeout(bookmarkTimeoutRef.current)
        }

        setPostBookmarked(prev => !prev)
    }

    useEffect(() => {
        const toggleBookmark = async () =>  {
            try {
                const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/bookmark/${post?._id}`, {}, {withCredentials: true})

                return data.data?.postIdArray?.indexOf(post?._id) === -1 ? false : true
            } catch (error) {
                console.log(error)
            }
        }

        bookmarkTimeoutRef.current = setTimeout(async () => {
            if(postBookmarked !== wasPostBookmarkedRef.current){
                console.log('request sent')
                const status = await toggleBookmark()
                wasPostBookmarkedRef.current = status
                post.userBookmarked = status
            }
        }, 700);

    }, [postBookmarked])

    return(
        <button onClick={(e) => handleBookmark(e)} className='min-w-12 group cursor-pointer flex justify-end items-end'>
            <div className="p-2 group-hover:bg-blue-100/60 rounded-full">
                <Bookmark strokeWidth={2} className={`h-4 w-4  group-hover:stroke-blue-500 ${postBookmarked ? 'fill-blue-500 stroke-blue-500' : 'stroke-gray-500'}`}/>
            </div>
        </button>
    )
}

export default BookmarkBtn
