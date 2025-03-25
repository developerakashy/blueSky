import { useEffect, useState } from "react"
import { useUser } from "../context/userContext"

function ReplyBtn({post}){
    const {user: loggedInUser, publishPost, setPublishPost, setLoading} = useUser()
    const [postReplyCount, setPostReplyCount] = useState(post?.replyCount || 0)

    const handelPostReply = (e) => {
        e.stopPropagation()
        if(!loggedInUser?._id) {
            toast.error('Log in to reply on post')
            return
        }
        setPublishPost({publish: true, parentPost: post})
    }

    useEffect(() => {
        if(publishPost.postPublishParentId === post._id){
            post.replyCount = parseInt(post?.replyCount) + 1
            setPostReplyCount(prev => prev + 1)
            setPublishPost({publish: false})
        }

    }, [publishPost])

    return(
        <button onClick={(e) => handelPostReply(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
            <div className="p-2 group-hover:bg-blue-100/60 rounded-full ">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 fill-gray-500 group-hover:fill-blue-500`}>
                    <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,0-1.41A8,8,0,1,1,12,20Z"/>
                </svg>
            </div>
            <p className="pt-[3px] font-medium group-hover:text-blue-500 ml-[-5px] brder">{postReplyCount}</p>
        </button>
    )
}

export default ReplyBtn
