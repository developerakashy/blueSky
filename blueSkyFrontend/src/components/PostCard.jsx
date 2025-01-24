import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router";



function PostCard({post, repliedTo}){
    const navigate = useNavigate()
    const {publishPost, setPublishPost} = useUser()
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const [postLikeCount, setPostLikeCount] = useState(post?.likeCount || 0)
    const [postReplyCount, setPostReplyCount] = useState(post?.replyCount || 0)
    const [postLiked, setPostLiked] = useState(post?.userLiked)

    let likeTimeoutRef = useRef(null)
    let wasPostLikedRef = useRef(post?.userLiked)

    const user = post?.userId
    const imageUrl = post?.mediaFiles
    const mediaLength = imageUrl?.length

    // useEffect(() => {
    //     setPostReplyCount(post?.replyCount || 0)
    //     setPostLikeCount(post?.likeCount || 0)
    //     setPostLiked(post?.userLiked || 0)
    // }, [post])

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
            case 2: return 'grid-cols-2 grid-rows-1 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            case 3: return 'grid-cols-2 grid-rows-2 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            case 4: return 'grid-cols-2 grid-rows-2 h-72 border-[1px] rounded-2xl overflow-hidden border-gray-300 gap-[1px]';
            default: return ''
        }
    }


    const handlePostLike = (e) => {
        e.stopPropagation()
        if(likeTimeoutRef.current){
            clearTimeout(likeTimeoutRef.current)
        }

        setPostLikeCount(prev => postLiked ? prev - 1 : prev + 1)
        setPostLiked(prev => !prev)

    }


    const handelPostReply = (e) => {
        e.stopPropagation()
        setPublishPost({publish: true, parentPost: post})
    }

    useEffect(() => {
        if(publishPost.postPublishParentId === post._id){
            post.replyCount = parseInt(post?.replyCount) + 1
            setPostReplyCount(prev => prev + 1)
            setPublishPost({publish: false})
        }

    }, [publishPost])


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

    return(
        <>
        <div onClick={() => navigate(`/post/${post?._id}`)} className='cursor-pointer hover:bg-slate-50 border-b-[1px] px-5 py-3 flex gap-2'>
            <div className='w-12 flex justify-center'>
                <img className='h-10 w-10 rounded-full object-cover' src={user?.avatar} alt="" />
            </div>

            <div className='w-full'>
                <div className='flex justify-between'>
                    <div onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/user/${user?.username}`)

                        }} className='flex'>
                        <div className='relative self-start group'>
                            <p className="text-sm font-semibold hover:underline">{user?.fullname?.toUpperCase()}</p>
                            <div className="z-10 absolute rounded-xl top-5 bg-white left-0 border-[1px] p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:delay-500">
                                <img className="rounded-full h-10 w-10 object-cover" src={user?.avatar} alt="" />
                                <p className="text-sm text-nowrap font-semibold mt-1">{user?.fullname?.toUpperCase()}</p>
                                <p className='text-gray-600 text-sm self-start'>@{user?.username?.toLowerCase()}</p>
                                <p className='text-sm self-start mt-2'>{user?.about}</p>
                                <div className="flex gap-5 mt-2">
                                    <p className="text-nowrap text-sm text-gray-600 hover:underline"><span className="font-semibold text-black">4</span> Followers</p>
                                    <p className="text-nowrap text-sm text-gray-600 hover:underline"><span className="font-semibold text-black">12</span> Followings</p>
                                </div>
                            </div>
                        </div>
                        <p className='self-start text-gray-600 mx-1'>·</p>
                        <p className='text-gray-600 text-sm self-start'>@{user?.username}</p>
                        <p className='self-start text-gray-600 mx-1'>·</p>
                        <p className='text-gray-600 text-sm'>8m</p>
                    </div>
                    <div>
                        <button className='self-start'>⋯</button>
                    </div>
                </div>

                <div className="mb-2">
                    {repliedTo && <p className="text-sm font-semibold text-gray-500 ">Replying to <span className="text-blue-500">@{repliedTo}</span></p>}
                    <p className='tracking-normal leading-tight text-[15px]'>{post?.text}</p>

                    {mediaLength > 0 &&
                        <div className={`grid ${mediaGallery()} mt-2`}>
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

                <div className='mt-2 flex justify-between mt-2'>
                    <button onClick={(e) => handelPostReply(e)} className='flex items-center'><img className='h-5 w-5' src="../../../comment.png" alt="" />{postReplyCount || 0}</button>
                    <button className='flex items-center'><img className='mr-1 h-4 w-4' src="../../../repost.png" alt="" />0</button>
                    <button onClick={(e) => handlePostLike(e)} className='flex items-center'><img className={`mr-1 h-4 w-4 ${postLiked && 'bg-red-200'}`} src="../../../heart.png" alt="" />{postLikeCount || 0}</button>
                    <button className='flex items-center'><img className='mr-1 h-4 w-4' src="../../../bar-chart.png" alt="" />0</button>
                </div>
            </div>

        </div>

        {previewImage &&
        <div className="z-30 fixed right-0 top-0 bottom-0 w-screen h-screen bg-black/90 flex flex-col items-center justify-center">
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
        <div className="z-30 fixed right-0 top-0 w-screen h-screen bg-black/90 flex flex-col items-center justify-center">
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

export default PostCard
