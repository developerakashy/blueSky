import React, { useRef, useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import PostCard from './PostCard'
import { useNavigate } from 'react-router'
import CreatePost from './CreatePost'
import axios from 'axios'
import PostText from './PostText'

function Post({post, postReplies, parentPost}){
    const {publishPost, setPublishPost} = useUser()
    const navigate = useNavigate()
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

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
            case 1: return `grid-cols-1 grid-rows-1 max-h-[516px] ${mediaType === 'video' ? 'w-full px-4' : 'w-fit mx-4'}`;
            case 2: return 'grid-cols-2 grid-rows-1 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-4';
            case 3: return 'grid-cols-2 grid-rows-2 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-4';
            case 4: return 'grid-cols-2 grid-rows-2 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px] mx-4';
            default: return ''
        }
    }

    const handelPostReply = (e) => {
        e.stopPropagation()
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
        if(likeTimeoutRef.current){
            clearTimeout(likeTimeoutRef.current)
        }

        setPostLikeCount(prev => postLiked ? prev - 1 : prev + 1)

        setPostLiked(prev => !prev)

    }

    useEffect(() => {
        const togglePostLike = async () => {
            try {
                const { data } = await axios.post(`http://localhost:8003/like/${post._id}`, {}, {withCredentials: true})

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

        if(bookmarkTimeoutRef.current){
            clearTimeout(bookmarkTimeoutRef.current)
        }

        setPostBookmarked(prev => !prev)
    }

    useEffect(() => {
        const toggleBookmark = async () =>  {
            try {
                const { data } = await axios.post(`http://localhost:8003/bookmark/${post?._id}`, {}, {withCredentials: true})

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

        if(repostTimeoutRef.current){
            clearTimeout(repostTimeoutRef.current)
        }

        setPostRepostCount(prev => postReposted ? prev - 1 : prev + 1)
        setPostReposted(prev => !prev)
    }

    useEffect(() => {
        const togglePostRepost = async () => {
            try {
                const { data } = await axios.post(`http://localhost:8003/repost/${post?._id}`, {}, {withCredentials: true})

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
        <div className='w-full'>
            <div className='sticky top-0 bg-white flex items-center p-2'>
                <button onClick={() => navigate(-1)} className='px-4 rounded-full mr-6'><img className='h-4' src="../../../back.png" alt="" /></button>
                <p className='text-xl font-semibold'>Post</p>
            </div>


            <div>
                <div className='px-4 py-2 flex justify-between'>
                    <div className='flex gap-2'>
                        <img className='block h-11 w-11 rounded-full object-cover' src={user?.avatar} alt="" />
                        <div className=''>
                            <p className='font-bold'>{user?.fullname?.toUpperCase()}</p>
                            <p className='text-sm text-slate-500'>@{user?.username?.toLowerCase()}</p>
                        </div>
                    </div>

                    <button>⋯</button>
                </div>

                <div className='w-full'>
                <div className="px-4">
                    <PostText  text={post?.text}/>
                </div>
                {mediaLength > 0 &&
                    <div className={`cursor-pointer grid ${mediaGallery()} mt-2`}>
                        {imageUrl && imageUrl.map((url, index) =>
                            url.split('/')[4] === 'image' ?
                            <img key={url} onClick={(e) => handleMediaPreview(e, index)} className={`${mediaLength === 3 && index === 0 && 'row-span-2'} ${mediaLength > 1 ? 'w-full' : 'w-fit rounded-2xl border-[1px]'} h-full object-cover`} src={url} alt="Image file" /> :
                            <video key={url} onClick={(e) => handleMediaPreview(e, index)} className={`${mediaLength === 3 && index === 0 && 'row-span-2'} ${mediaLength > 1 ? 'w-full' : 'w-fit rounded-2xl border-[1px]'} h-full w-full bg-black`}  controls>
                                <source src={url} alt='video'/>
                            </video>
                        )}


                    </div>
                }
                </div>

                <div className='flex px-4 py-3'>
                    <p className='text-gray-600 self-start'>10:19 AM</p>
                    <p className='self-start text-gray-600 mx-1'>·</p>
                    <p className='text-gray-600 self-start'>Jan 10, 2025</p>
                    <p className='self-start text-gray-600 mx-1'>·</p>
                    <p className='text-gray-600 self-start'>55.k views</p>
                </div>

                <div className='flex justify-between mx-4 py-3 border-y-[1px]'>
                    <button onClick={(e) => handelPostReply(e)} className='flex items-center'><img className='h-6 w-6' src="../../../comment.png" alt="" />{postReplyCount}</button>
                    <button onClick={(e) => handleRepost(e)} className='flex items-center'><img className={`mr-1 h-5 w-5 ${postReposted ? 'bg-green-200' : ''}`} src="../../../repost.png" alt="" />{postRepostCount}</button>
                    <button onClick={(e) => handlePostLike(e)} className='flex items-center'><img className={`mr-1 h-5 w-5 ${postLiked ? 'bg-red-200' : ''}`} src="../../../heart.png" alt="" />{postLikeCount}</button>
                    <button onClick={(e) => handleBookmark(e)} className='flex items-center'><img className={`mr-1 h-5 w-5 ${postBookmarked ? 'bg-blue-200' : ''}`} src="../../../bookmark.png" alt="" /></button>
                </div>

                <div className='flex justify-between p-4 border-b-[1px]'>
                    <div className='flex items-center gap-2'>
                    <img className='h-10 w-10 object-cover rounded-full' src={user?.avatar} alt="" />
                    <p className=''>Post your reply</p>
                    </div>

                    <button onClick={() => setPublishPost({publish: true, setPosts, parentPost: post})} className='px-4 bg-blue-700 text-sm text-white rounded-full'>Reply</button>
                </div>
            </div>

            <div>
                {posts && posts.map(reply => reply?._id && <PostCard key={reply._id} post={reply}/>)}
            </div>
        </div>

        {previewImage &&
        <div className="z-30 fixed right-0 top-0 bottom-0 w-screen h-screen backdrop-blur bg-black/90 flex flex-col items-center justify-center">
            <button className="fixed top-5 left-12 text-white" onClick={(e) => closeModal(e)}>Close</button>
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
            <button className="fixed z-40 top-5 left-12 text-white" onClick={(e) => closeModal(e)}>Close</button>
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
