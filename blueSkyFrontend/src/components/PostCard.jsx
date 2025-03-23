import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../context/postContext";
import { Bookmark, Heart, Repeat2, UserRound } from "lucide-react";
import PostText from "./PostText";
import formatTimeLine from "../utils/formatTimeLine";
import toast from "react-hot-toast";


function PostCard({post, repliedTo, parentPost}){

    const navigate = useNavigate()
    const {setPosts} = usePostContext()
    const {user: loggedInUser, publishPost, setPublishPost, setLoading} = useUser()
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [postMenu, setPostMenu] = useState(false)

    const [postLikeCount, setPostLikeCount] = useState(post?.likeCount || 0)
    const [postReplyCount, setPostReplyCount] = useState(post?.replyCount || 0)
    const [postRepostCount, setPostRepostCount] = useState(post?.repostCount || 0)

    const [postLiked, setPostLiked] = useState(post?.userLiked)
    const [postBookmarked, setPostBookmarked] = useState(post?.userBookmarked || false)
    const [postReposted, setPostReposted] = useState(post?.userReposted || false)

    let likeTimeoutRef = useRef(null)
    let bookmarkTimeoutRef = useRef(null)
    let repostTimeoutRef = useRef(null)

    let wasPostLikedRef = useRef(post?.userLiked)
    let wasPostBookmarkedRef = useRef(post?.userBookmarked || false)
    let wasPostRepostedRef = useRef(post?.userReposted || false)

    const user = post?.userId
    const imageUrl = post?.mediaFiles
    const mediaLength = imageUrl?.length

    const redirectUserProfile = (e) => {
        e.stopPropagation()
        navigate(`/user/${user?.username}`)
    }


    const handleDropDown = (e) => {
        e.stopPropagation()

        setPostMenu(prev => !prev)
    }

    const handlePostDelete = (e) => {
        e.stopPropagation()

        const deletePost = async () => {
            setLoading(true)

            try {
                const { data } = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/post/${post?._id}`, {withCredentials: true})

                console.log(data)
                setPosts(prev => prev.filter(post => post?._id !== data?.data?._id))

                toast.success('Post deleted successfully')


            } catch (error) {
                console.log(error)
                toast.error(error?.response?.data?.message)

            }finally {
                setLoading(false)

            }
        }

        deletePost()
    }

    useEffect(() => {
        if(previewImage || previewVideo){
            document.body.style = 'overflow: hidden'
        } else {
            document.body.style = 'overflow: auto'
        }
    }, [previewImage, previewVideo])

    const handleMediaPreview = (e, index) => {
        e.stopPropagation()
        setCurrentIndex(index)

        if(imageUrl[index].split('/')[4] === 'video'){
            setPreviewVideo(true)
        } else {
            setPreviewImage(true)
        }
        console.log(index)
    }

    const closeModal = (e) => {
        e.stopPropagation()
        if(imageUrl[currentIndex].split('/')[4] === 'video'){
            setPreviewVideo(false)
        } else {
            setPreviewImage(false)
        }
    }

    const mediaGallery = () => {
        let mediaType = ''
        if(mediaLength === 1){
            mediaType = imageUrl[0].split('/')[4]
        }

        switch(mediaLength){
            case 1: return `grid-cols-1 grid-rows-1 max-h-[516px] ${mediaType === 'video' ? 'w-full' : 'w-fit'}`;
            case 2: return 'grid-cols-2 grid-rows-1 min-h-48 max-h-56 sm:min-h-72 sm:max-h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            case 3: return 'grid-cols-2 grid-rows-2 min-h-48 max-h-56 sm:min-h-72 sm:max-h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            case 4: return 'grid-cols-2 grid-rows-2 min-h-48 max-h-56 sm:min-h-72 sm:max-h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            default: return ''
        }
    }


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
        }, 700)

        return () => {
            if(likeTimeoutRef.current){
                clearTimeout(likeTimeoutRef.current)
            }
        }

    }, [postLiked])


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
        <>
        <div onClick={() => navigate(`/post/${post?._id}`)} className={`cursor-pointer hover:bg-slate-50 ${parentPost ? '' : 'border-b'} border-slate-200 px-2 flex gap-2`}>
            <div className={`w-12 flex flex-col items-center ${(parentPost && post?.parentPost) ? '' : 'pt-3'}`}>
                {(parentPost && post?.parentPost) &&
                    <div className="border h-3 border-slate-300"></div>
                }

                {!user?.avatar ?
                    <div onClick={(e) => redirectUserProfile(e)} className='min-h-10 max-h-10 min-w-10 max-w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                        <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                    </div> :

                    <img onClick={(e) => redirectUserProfile(e)} className='min-h-10 max-h-10 min-w-10 max-w-10 rounded-full object-cover' src={user?.avatar} alt="" />
                }

                {(parentPost) &&
                    <div className="border h-full border-slate-300"></div>
                }
            </div>

            <div className='w-full pt-3'>
                <div className='flex justify-between'>
                    <div onClick={(e) => redirectUserProfile(e)} className='flex items-center'>
                        <p className="text-sm font-semibold hover:underline">{user?.fullname?.toUpperCase()}</p>
                        <div className='h-1 w-1 bg-gray-600 rounded-xl mx-1'></div>
                        <p className='text-gray-600 text-sm'>@{user?.username}</p>
                        <div className='h-1 w-1 bg-gray-600 rounded-full mx-1'></div>
                        <p className='text-gray-600 text-sm'>{formatTimeLine(post?.createdAt)}</p>
                    </div>
                    {loggedInUser?.username === user?.username && <div className="relative flex flex-col items-end">
                        <button onClick={(e) => handleDropDown(e)} className='cursor-pointer'>⋯</button>
                        {postMenu  &&
                        <div  className="absolute flex flex-col bg-white top-7 border-[1px] rounded-xl w-40 overflow-hidden">
                            <button onClick={(e) => handlePostDelete(e)} className="cursor-pointer z-40 text-nowrap w-full py-1 border-b-[1px] text-red-500 hover:bg-red-50">Delete</button>
                        </div>
                        }
                    </div>}
                </div>

                <div className="">
                    {repliedTo && <p className="text-sm mb-1 font-semibold text-gray-500 ">Replying to <span onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/user/${repliedTo}`)

                        }} className="text-blue-500">@{repliedTo}</span></p>}
                    <PostText text={post?.text}/>

                    {mediaLength > 0 &&
                        <div className={`grid ${mediaGallery()} mt-2`}>
                            {imageUrl && imageUrl.map((url, index) =>
                                url.split('/')[4] === 'image' ?
                                <img key={url} onClick={(e) => handleMediaPreview(e, index)} className={`${mediaLength === 3 && index === 0 && 'row-span-2'} ${mediaLength > 1 ? 'w-full' : 'w-fit rounded-2xl border border-slate-200'} h-full object-cover`} src={url} alt="Image file" /> :
                                <video key={url} onClick={(e) => handleMediaPreview(e, index)} className={`${mediaLength === 3 && index === 0 && 'row-span-2'} ${mediaLength > 1 ? 'w-full' : 'w-fit rounded-2xl border border-slate-200'} h-full w-full bg-black`}  controls>
                                    <source src={url} alt='video'/>
                                </video>
                            )}


                        </div>
                    }
                </div>

                <div className='flex justify-between ml-[-8px]'>
                    <button onClick={(e) => handelPostReply(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
                        <div className="p-2 group-hover:bg-blue-100/60 rounded-full ">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 fill-gray-500 group-hover:fill-blue-500`}>
                                <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,0-1.41A8,8,0,1,1,12,20Z"/>
                            </svg>
                        </div>
                        <p className="pt-[3px] font-medium group-hover:text-blue-500 ml-[-5px] brder">{postReplyCount}</p>
                    </button>

                    <button onClick={(e) => handleRepost(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
                        <div className="p-2 group-hover:bg-green-100/60 transition-colors duration-200 rounded-full">
                            <Repeat2 strokeWidth={2} className={`h-4.5 w-4.5 stroke-gray-500 group-hover:stroke-green-500 ${postReposted ? 'stroke-green-500': ''}`}/>
                        </div>
                        <p className={`pt-[3px] font-medium group-hover:text-green-500 ml-[-5px] ${postReposted ? 'text-green-500': ''}`}>{postRepostCount}</p>
                    </button>

                    <button onClick={(e) => handlePostLike(e)} className='min-w-12 group cursor-pointer flex items-center text-xs text-gray-500'>
                    <div className="p-2 group-hover:bg-red-100/60 transition-colors duration-200 rounded-full">
                        <Heart strokeWidth={2} className={`h-4 w-4 stroke-gray-500 group-hover:stroke-red-400 ${postLiked ? 'fill-red-400 stroke-red-400' : ''}`}/>
                    </div>
                    <p className={`pt-[3px] font-medium group-hover:text-red-400 ml-[-5px] ${postLiked ? 'text-red-400' : ''}`}>{postLikeCount}</p>
                    </button>

                    <button onClick={(e) => handleBookmark(e)} className='min-w-12 group cursor-pointer flex justify-end items-end'>
                        <div className="p-2 group-hover:bg-blue-100/60 rounded-full">
                            <Bookmark strokeWidth={2} className={`h-4 w-4  group-hover:stroke-blue-500 ${postBookmarked ? 'fill-blue-500 stroke-blue-500' : 'stroke-gray-500'}`}/>
                        </div>
                    </button>
                </div>
            </div>

        </div>

        {previewImage &&
        <div className="z-40 fixed right-0 top-0 bottom-0 w-screen h-screen bg-black/90 flex flex-col items-center justify-center">
            <button className="cursor-pointer fixed top-5 left-12 text-white" onClick={(e) => closeModal(e)}>Close</button>
            <div className="h-[95%] flex items-center">
                <img className="min-h-[600px] max-h-full object-contain" src={imageUrl[currentIndex]} alt="" />
            </div>

            <div className="h-[5%] w-full">
                <p className="text-white"></p>
            </div>

        </div>
        }

        {previewVideo &&
        <div className="z-40 fixed right-0 top-0 w-screen h-screen bg-black/90 flex flex-col items-center justify-center">
            <button className="cursor-pointer fixed z-40 top-5 left-12 text-white" onClick={(e) => closeModal(e)}>Close</button>
            <div className="h-[95%] flex items-center object-contain">
                <video className="max-h-full min-w-[600px]" src={imageUrl[currentIndex]} controls>
                    <source src={imageUrl[currentIndex]}/>
                </video>
            </div>

            <div className="h-[5%] w-full">
                <p className="text-white"></p>
            </div>

        </div>
        }
        </>
    )
}

export default PostCard
