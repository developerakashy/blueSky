import React, { useRef, useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import PostCard from './PostCard'
import { useNavigate } from 'react-router'
import CreatePost from './CreatePost'

function Post({post, postReplies, parentPost}){
    const {publishPost, setPublishPost} = useUser()
    const user = post?.userId
    const [publishReply, setPublishReply] = useState(false)
    const [previewImage, setPreviewImage] = useState(false)
    const [previewVideo, setPreviewVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [posts, setPosts] = useState(postReplies)

    useEffect(() => {
        setPosts(postReplies)
    }, [postReplies])

    const [postLikeCount, setPostLikeCount] = useState(post?.likeCount)
    const [postLiked, setPostLiked] = useState(post?.userLiked)

    const navigate = useNavigate()

    let likeTimeoutRef = useRef(null)
    let wasPostLikedRef = useRef(post?.userLiked)


    const imageUrl = post?.mediaFiles
    const mediaLength = imageUrl?.length

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



    const handlePostLike = (e, postId) => {
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
            if(!(postLiked === wasPostLikedRef.current)){
                console.log('request sent')
                const result = await togglePostLike()
                wasPostLikedRef.current = postLiked
                setPostLikeCount(result)

            }
        }, 1000)



    }, [postLiked])


    

    return(
    <>
        <div className='w-[600px] min-h-screen mb-[0.45px]'>
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
                <p className='px-4'>{post?.text}</p>
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
                    <button className='flex items-center'><img className='h-6 w-6' src="../../../comment.png" alt="" />{post?.replyCount}</button>
                    <button className='flex items-center'><img className='mr-1 h-5 w-5' src="../../../repost.png" alt="" />0</button>
                    <button className='flex items-center'><img className={`mr-1 h-5 w-5 ${post?.userLiked && 'bg-red-200'}`} src="../../../heart.png" alt="" />{post?.likeCount}</button>
                    <button className='flex items-center'><img className='mr-1 h-5 w-5' src="../../../bar-chart.png" alt="" />2</button>
                </div>

                <div className='flex justify-between p-4 border-b-[1px] pb-8'>
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
