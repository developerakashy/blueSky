import React, { useEffect, useState, useRef } from "react"
import { useUser } from "../context/userContext"
import axios from "axios"
import PostCard from "./PostCard"
import Verification from "./Verification"
import { Image, UserRound, X } from "lucide-react"
import PostInput from "./PostInput"
import { toast } from "react-toastify"

const users = ["Akash", "JohnDoe", "JaneDoe", "Alice", "Bob"];

function CreatePost({setPosts, parentPost, setPublishPost}){
    const { user, setLoading } = useUser()
    const [postPublished, setPostPublished] = useState('')
    const [text, setText] = useState('')
    const [imageUrls, setImageFiles] = useState([])
    const [files, setFiles] = useState([])

    console.log(text)
    useEffect(() => {

        if(postPublished?._id){
            console.log(setPosts)
            setPosts && setPosts(prev => [postPublished,...prev])

            setTimeout(() => {
              setPublishPost({publish: false, postPublishId: postPublished._id, postPublishParentId: postPublished.parentPost})
            }, 700)
        }

    }, [postPublished])

    const handleFileInput = (e) => {
        const mediaFiles = Array.from(e.target.files)
        console.log(mediaFiles)

        mediaFiles.forEach(file => {
            setFiles(prev => [...prev, file])
            if(file){
                let imageUrl = URL.createObjectURL(file)
                setImageFiles(prev => [...prev, {type: file.type.split('/')[0], url: imageUrl}])
            }
        });
    }


    const uploadFiles = async () => {
        setLoading(true)
        const formdata = new FormData()

        if(parentPost?._id){
            formdata.append('parentPostId', parentPost?._id)
        }
        formdata.append('text', text)

        files.forEach((file, index) => {
            formdata.append(`mediaFiles`, file)
        })

        const values = []

        for(const [key, value] of formdata){

          if(key === 'text' && value?.trim()){
            values.push(value)

          } else if(key === 'mediaFiles') {
            values.push(value)

          }
        }

        console.log(values)

        if(values.length < 1){
          toast.warn('Post cannot be empty')
          setTimeout(() => setLoading(false), 700)

          return
        }


        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/${parentPost?._id ? 'reply' : 'post'}/publish`, formdata, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            })

            setPostPublished(data.data)
            toast.success('Post published successfully')

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setTimeout(() => setLoading(false), 700)
        }
    }


    return(
        <div className="z-40 w-screen h-screen left-0 bottom-0 fixed top-0 bg-black/20 flex justify-center">
            {!user?.isVerified &&
                <Verification setPublishPost={setPublishPost}/>
            }

            {user?.isVerified &&
                <div className="bg-white max-h-[80%] overflow-hidden overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:bg-gray-400
                h-min relative mt-12 pt-14 rounded-xl max-w-[620px]">
                <X strokeWidth={2.5} onClick={() => setPublishPost({publish: false})} className="cursor-pointer absolute left-3 top-3 p-1 rounded-full stroke-slate-700 hover:bg-slate-300 h-6 w-6"/>
                {/* <button className="cursor-pointer  bg-white border-slate-300 rounded-full hover:bg-slate-300" onClick={() => setPublishPost({publish: false})}><img className="h-5 w-5 p-1 rounded-full" src="../../cross.png"/></button> */}
                {parentPost &&
                <div className="mx-4 flex gap-2">
                    <div className='min-w-12 flex flex-col gap-2 items-center'>
                        {!parentPost?.userId?.avatar ?
                            <div className='min-h-10 w-10 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                                <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                            </div> :

                            <img className='min-h-10 w-10 rounded-full object-cover' src={parentPost?.userId?.avatar} alt="" />
                        }
                        <div className="h-full pb-3 border border-slate-300"></div>
                    </div>

                    <div className=''>
                        <div className='flex justify-between'>
                            <div className='flex'>
                                <p className="text-sm self-start font-semibold">{parentPost?.userId?.fullname?.toUpperCase()}</p>
                                <p className='self-start text-gray-600 mx-1'>·</p>
                                <p className='text-gray-600 text-sm self-start'>@{parentPost?.userId?.username}</p>
                                <p className='self-start text-gray-600 mx-1'>·</p>
                                <p className='text-gray-600 text-sm'>8m</p>
                            </div>
                        </div>

                        <div className="w-full text-ellipsis line-clamp-5">
                            <p className='max-w-[560px] tracking-normal leading-tight text-[15px]'>{parentPost?.text}</p>
                            {parentPost?.mediaFiles &&
                                <div className="mt-2">
                                {parentPost?.mediaFiles.map(url => <p key={url} className="max-w-[500px] text-ellipsis overflow-hidden">{url}</p>)}
                                </div>
                            }
                        </div>

                    </div>
                </div>
                }
                {parentPost &&
                <div className="py-2 mx-4 flex gap-2">
                    <div className='w-12 flex justify-center'>
                    <div className="h-full py-4 border border-slate-300"></div>
                    </div>

                    <div className=''>
                        <p className="text-start text-gray-600">Replying to <span className="text-blue-500">@{parentPost?.userId?.username}</span></p>
                    </div>
                </div>
                }
                <div className="bg-white mx-4 flex items-start gap-2 mb-4 relative">
                    {!user?.avatar ?
                        <div className='h-10 w-10 mx-1 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                            <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                        </div> :

                        <img className='h-10 w-10 mx-1 rounded-full object-cover' src={user?.avatar} alt="" />
                    }
                    <div className="w-[512px] flex flex-col gap-2">

                        <PostInput setContent={setText} content={text}/>

                        {imageUrls?.length > 0 &&
                            <div className={`flex overflow-x-auto pb-2  ${imageUrls.length > 1 && 'h-80'} max-h-[512px] mb-6
                            [&::-webkit-scrollbar]:h-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:bg-gray-400
                            gap-2`}>
                                {imageUrls && imageUrls.map((media, index) =>
                                    <div key={media.url} className={`min-w-[250px]`}>
                                        {media.type === 'image' ?
                                        <img className={`rounded-xl border border-slate-200 ${imageUrls.length > 1 ? 'w-[250px]' : 'w-fit'} h-full object-contain`} src={media.url} alt="" /> :
                                        <video className={`rounded-2xl border border-slate-200 ${imageUrls.length > 1 ? 'w-[250px]' : 'w-full'} h-full bg-white`}  controls>
                                            <source src={media.url}/>
                                        </video>}
                                    </div>
                                )}


                            </div>
                        }
                    </div>
                </div>


                <div className="bg-white flex absolute px-4 sticky bottom-0 w-full justify-between items-center border-t border-slate-200 py-2">
                    <label htmlFor="dropFile" className="cursor-pointer">
                    <Image className="stroke-blue-600"/>
                    </label>
                    <input
                        id="dropFile"
                        name="mediaFiles"
                        className="hidden"
                        accept="image/jpeg, image/png, image/webp, image/gif ,video/mp4"
                        type="file"
                        disabled={imageUrls.length >= 4}
                        onChange={(e) => handleFileInput(e)}
                    />

                    <button className="cursor-pointer bg-indigo-600 text-white px-4 py-1 rounded-full" onClick={uploadFiles}>Publish</button>
                </div>
                </div>
            }
        </div>
    )
}

export default CreatePost
