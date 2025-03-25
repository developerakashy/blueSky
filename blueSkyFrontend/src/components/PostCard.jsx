import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../context/postContext";
import { Ellipsis, UserRound, X } from "lucide-react";
import PostText from "./PostText";
import formatTimeLine from "../utils/formatTimeLine";
import toast from "react-hot-toast";
import Like from "./LikeBtn";
import RepostBtn from "./RepostBtn";
import BookmarkBtn from "./BookmarkBtn";
import ReplyBtn from "./ReplyBtn";


function PostCard({post, repliedTo, parentPost}){
    const navigate = useNavigate()
    const {setPosts} = usePostContext()
    const {user: loggedInUser, setLoading} = useUser()
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [postMenu, setPostMenu] = useState(false)

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
    }, [previewImage, previewVideo, postMenu])

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


    return(
        <div className="relative">
            <div onClick={() => navigate(`/post/${post?._id}`)} className={`cursor-pointer hover:bg-slate-50 ${parentPost ? '' : 'border-b'} border-slate-200 px-2 flex gap-2 relative`}>
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
                    <div className='relative flex justify-between'>
                        <div onClick={(e) => redirectUserProfile(e)} className='flex items-center'>
                            <p className="text-sm font-semibold hover:underline">{user?.fullname?.toUpperCase()}</p>
                            <div className='h-1 w-1 bg-gray-600 rounded-xl mx-1'></div>
                            <p className='text-gray-600 text-sm'>@{user?.username}</p>
                            <div className='h-1 w-1 bg-gray-600 rounded-full mx-1'></div>
                            <p className='text-gray-600 text-sm'>{formatTimeLine(post?.createdAt)}</p>
                        </div>
                        {loggedInUser?.username === user?.username &&
                            <div className="absolute right-0 flex flex-col items-end">
                                <Ellipsis onClick={(e) => handleDropDown(e)} className='min-h-8 min-w-8 p-2 duration-200 stroke-slate-600 cursor-pointer hover:bg-blue-500/20 hover:stroke-blue-500 rounded-full'/>
                            </div>
                        }
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
                        <ReplyBtn post={post}/>

                        <RepostBtn post={post}/>

                        <Like post={post}/>

                        <BookmarkBtn post={post}/>
                    </div>
                </div>

            </div>

            {postMenu  &&
                <>
                    <div onClick={(e) => setPostMenu(false)} className="fixed top-0 bottom-0 right-0 left-0 w-full z-20 flex flex-col bg-transparent border-[1px]"/>
                    <div className="absolute right-3 top-3 z-20 bg-white border border-slate-200 rounded-xl w-52">
                        <button onClick={(e) => handlePostDelete(e)} className="cursor-pointer text-nowrap w-full py-1 rounded-xl text-red-500 duration-100 hover:bg-red-100/50">Delete</button>
                    </div>
                </>
            }


            {previewImage &&
            <div className="z-40 fixed right-0 top-0 bottom-0 w-screen h-screen bg-black/90 flex flex-col items-center justify-center">
                <X strokeWidth={2.5} onClick={(e) => closeModal(e)} className="cursor-pointer fixed top-6 left-6 p-1 rounded-full bg-white stroke-black hover:bg-red-500 hover:stroke-white h-6 w-6"/>
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
                <X strokeWidth={2.5} onClick={(e) => closeModal(e)} className="cursor-pointer z-40 fixed top-6 left-6 p-1 rounded-full bg-white stroke-black hover:bg-red-500 hover:stroke-white h-6 w-6"/>

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
        </div>
    )
}

export default PostCard
