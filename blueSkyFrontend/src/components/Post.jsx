import React, { useRef, useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import PostCard from './PostCard'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PostText from './PostText'
import { Bookmark, Heart, Repeat2, UserRound } from 'lucide-react'
import formatTime from '../utils/formatTime'
import formatDate from '../utils/formatDate'
import toast from 'react-hot-toast'
import { usePostContext } from '../context/postContext'

function Post({post, postReplies, parentPost}){
    const {setPosts: setPostContext} = usePostContext()
    const {user: loggedInUser, publishPost, setPublishPost, setLoading} = useUser()
    const navigate = useNavigate()
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [postMenu, setPostMenu] = useState(false)

    const [posts, setPosts] = useState(postReplies)
    const [postReplyCount, setPostReplyCount] = useState(post?.replyCount || 0)
    const [postLikeCount, setPostLikeCount] = useState(post?.likeCount || 0)
    const [postRepostCount, setPostRepostCount] = useState(post?.repostCount || 0)

    const [postLiked, setPostLiked] = useState(post?.userLiked || false)
    const [postBookmarked, setPostBookmarked] = useState(post?.userBookmarked || false)
    const [postReposted, setPostReposted] = useState(post?.userReposted || false)


    let likeTimeoutRef = useRef(null)
    let bookmarkTimeoutRef = useRef(null)
    let repostTimeoutRef = useRef(null)

    let wasPostLikedRef = useRef(post?.userLiked || false)
    let wasPostBookmarkedRef = useRef(post?.userBookmarked || false)
    let wasPostRepostedRef = useRef(post?.userReposted || false)

    const user = post?.userId
    const imageUrl = post?.mediaFiles
    const mediaLength = imageUrl?.length

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
                setPostContext(prev => prev.filter(post => post?._id !== data?.data?._id))

                toast.success('Post deleted successfully')
                navigate('/')


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
        setPosts(postReplies)
        setPostLikeCount(post?.likeCount)
        setPostReplyCount(post?.replyCount)
        setPostRepostCount(post?.repostCount)

        setPostLiked(post?.userLiked)
        setPostBookmarked(post?.userBookmarked)
        setPostReposted(post?.userReposted)

        wasPostLikedRef.current = post?.userLiked
        wasPostBookmarkedRef.current = post?.userBookmarked
        wasPostRepostedRef.current = post?.userReposted
    }, [postReplies, post])

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
            case 1: return `grid-cols-1 grid-rows-1 max-h-[516px] ${mediaType === 'video' ? 'w-full px-2' : 'w-fit mx-2'}`;
            case 2: return 'grid-cols-2 grid-rows-1 min-h-56 max-h-56 sm:h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-2';
            case 3: return 'grid-cols-2 grid-rows-2 min-h-56 max-h-56 sm:h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-2';
            case 4: return 'grid-cols-2 grid-rows-2 min-h-56 max-h-56 sm:h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-2';
            default: return ''
        }
    }

    const handelPostReply = (e) => {
        e.stopPropagation()
        if(!loggedInUser?._id) {
            toast.error('Log in to reply on post')
            return
        }
        setPublishPost({publish: true, setPosts, parentPost: post})
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
            }
        }

        likeTimeoutRef.current = setTimeout(async () => {
            if(postLiked !== wasPostLikedRef.current){
                console.log('request sent')
                const result = await togglePostLike()
                wasPostLikedRef.current = postLiked
                setPostLikeCount(result)
            }
        }, 500)

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
        }, 500);

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
                console.log('request sent')
            }

        }, 700)

    }, [postReposted])


    return(
    <>
        <div className='w-full'>
            <div className='sticky top-0 border-r border-slate-200 bg-white/70 backdrop-blur-sm z-30 flex items-center py-2 px-1 gap-4'>
                <button onClick={() => navigate(-1)} className='cursor-pointer p-2 backdrop-blur-md hover:bg-black/10 rounded-full ml-2 rounded-full'><img className='h-4' src="../../.././back.png" alt="" /></button>
                <p className='text-xl font-semibold'>Post</p>
            </div>

            <div className=''>
                {parentPost?.length > 0 &&
                    parentPost.map(parent => <PostCard key={parent?._id} post={parent} parentPost={true}/>)
                }
            </div>

            <div>
                <div className='px-2 py-2 flex justify-between'>
                    <div className='flex gap-2'>
                        {!user?.avatar ?
                            <div onClick={() => navigate(`/user/${user?.username}`)} className='cursor-pointer h-10 w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                                <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                            </div> :

                            <img onClick={() => navigate(`/user/${user?.username}`)} className='cursor-pointer block h-10 w-10 rounded-full object-cover' src={user?.avatar} alt="" />
                        }
                        <div>
                            <p onClick={() => navigate(`/user/${user?.username}`)} className='cursor-pointer font-bold'>{user?.fullname?.toUpperCase()}</p>
                            <p onClick={() => navigate(`/user/${user?.username}`)} className='cursor-pointer text-sm text-slate-500'>@{user?.username?.toLowerCase()}</p>
                        </div>
                    </div>

                    {loggedInUser?.username === user?.username &&
                        <div className="relative flex flex-col items-end">
                            <button onClick={(e) => handleDropDown(e)} className='cursor-pointer'>⋯</button>
                            {postMenu  &&
                                <div  className="absolute flex flex-col bg-white top-7 border-[1px] rounded-xl w-40 overflow-hidden">
                                    <button onClick={(e) => handlePostDelete(e)} className="cursor-pointer text-nowrap w-full py-1 border-b-[1px] text-red-500 hover:bg-red-50">Delete</button>
                                </div>
                            }
                        </div>
                    }

                </div>

                <div className='w-full'>
                <div className="px-2">
                    <PostText  text={post?.text}/>
                </div>
                {mediaLength > 0 &&
                    <div className={`cursor-pointer grid ${mediaGallery()} mt-2`}>
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

                <div className='flex px-2 py-3 text-sm'>
                    <p className='text-gray-600 self-start'>{formatTime(post?.createdAt)}</p>
                    <p className='self-start text-gray-600 mx-1'>·</p>
                    <p className='text-gray-600 self-start'>{formatDate(post?.createdAt)}</p>
                    {/* <p className='self-start text-gray-600 mx-1'>·</p>
                    <p className='text-gray-600 self-start'>55.k views</p> */}
                </div>

                <div className='flex justify-between mx-2 py-1 border-y border-slate-200 text-sm'>
                    <button onClick={(e) => handelPostReply(e)} className='min-w-12 group cursor-pointer flex items-center text-gray-500'>
                        <div className="p-2 group-hover:bg-blue-100/60 rounded-full ">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`h-4.5 w-4.5 fill-gray-500 group-hover:fill-blue-500`}>
                                <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,0-1.41A8,8,0,1,1,12,20Z"/>
                            </svg>
                        </div>
                        <p className="pt-1 font-medium group-hover:text-blue-500 ml-[-5px] brder">{postReplyCount}</p>
                    </button>

                    <button onClick={(e) => handleRepost(e)} className='min-w-12 group cursor-pointer flex items-center text-gray-500'>
                        <div className="p-2 group-hover:bg-green-100/60 transition-colors duration-200 rounded-full">
                            <Repeat2 strokeWidth={2} className={`h-5 w-5 stroke-gray-500 group-hover:stroke-green-500 ${postReposted ? 'stroke-green-500': ''}`}/>
                        </div>
                        <p className={`pt-1 font-medium group-hover:text-green-500 ml-[-5px] ${postReposted ? 'text-green-500': ''}`}>{postRepostCount}</p>
                    </button>

                    <button onClick={(e) => handlePostLike(e)} className='min-w-12 group cursor-pointer flex items-center text-gray-500'>
                    <div className="p-2 group-hover:bg-red-100/60 transition-colors duration-200 rounded-full">
                        <Heart strokeWidth={2} className={`h-4.5 w-4.5 stroke-gray-500 group-hover:stroke-red-400 ${postLiked ? 'fill-red-400 stroke-red-400' : ''}`}/>
                    </div>
                    <p className={`pt-1 font-medium group-hover:text-red-400 ml-[-5px] ${postLiked ? 'text-red-400' : ''}`}>{postLikeCount}</p>
                    </button>

                    <button onClick={(e) => handleBookmark(e)} className='min-w-12 group cursor-pointer flex justify-end items-center'>
                        <div className="p-2 group-hover:bg-blue-100/60 rounded-full">
                            <Bookmark strokeWidth={2} className={`h-4.5 w-4.5  group-hover:stroke-blue-500 ${postBookmarked ? 'fill-blue-500 stroke-blue-500' : 'stroke-gray-500'}`}/>
                        </div>
                    </button>
                </div>

                <div className='flex justify-between p-4 border-b border-slate-200'>
                    <div className='flex items-center gap-2'>
                    {!loggedInUser?.avatar ?
                        <div className='h-10 w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                            <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                        </div> :

                        <img className='h-10 w-10 rounded-full object-cover' src={loggedInUser?.avatar} alt="" />
                    }
                    <p className=''>Post your reply</p>
                    </div>

                    <button onClick={() => setPublishPost({publish: true, setPosts, parentPost: post})} className='cursor-pointer px-4 bg-blue-700 text-sm text-white rounded-full'>Reply</button>
                </div>
            </div>

            <div className='pb-130'>
                {posts && posts.map(reply => reply?._id && <PostCard key={reply._id} post={reply}/>)}
            </div>
        </div>

        {previewImage &&
        <div className="z-30 fixed right-0 top-0 bottom-0 w-screen h-screen backdrop-blur bg-black/90 flex flex-col items-center justify-center">
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
        <div className="z-30 fixed right-0 top-0 w-screen h-screen backdrop-blur bg-black/90 flex flex-col items-center justify-center">
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

export default Post
