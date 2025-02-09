import React, { useEffect, useState } from "react"
import { useUser } from "../context/userContext"
import axios from "axios"
import PostCard from "./PostCard"
import Verification from "./Verification"

function CreatePost({setPosts, parentPost, setPublishPost}){
    const { user } = useUser()
    const [postPublished, setPostPublished] = useState('')
    const [text, setText] = useState('')
    const [imageUrls, setImageFiles] = useState([])
    const [files, setFiles] = useState([])

    useEffect(() => {

        if(postPublished?._id){
            console.log(setPosts)
            setPosts && setPosts(prev => [...prev, postPublished])

            setPublishPost({publish: false, postPublishId: postPublished._id, postPublishParentId: postPublished.parentPost})
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
        const formdata = new FormData()

        if(parentPost?._id){
            formdata.append('parentPostId', parentPost?._id)
        }
        formdata.append('text', text)

        files.forEach((file, index) => {
            formdata.append(`mediaFiles`, file)
        })

        try {
            const { data } = await axios.post(`http://localhost:8003/${parentPost?._id ? 'reply' : 'post'}/publish`, formdata, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            })

            setPostPublished(data.data)

        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div className="z-40 w-screen h-screen left-0 bottom-0 fixed top-0 bg-black/20 flex justify-center border-2">
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
                h-min relative border-[1px] mt-12 pt-12 rounded-xl max-w-[620px]">
                <button className="cursor-pointer absolute left-3 top-3 bg-white border-1 border-slate-300 rounded-full hover:bg-slate-300" onClick={() => setPublishPost({publish: false})}><img className="h-5 w-5 p-1 rounded-full" src="../../cross.png"/></button>
                {parentPost &&
                <div className="mx-4 flex gap-2">
                    <div className='min-w-12 flex flex-col gap-2 items-center'>
                        <img className='block min-h-10 w-10 rounded-full object-cover' src={parentPost?.userId?.avatar} alt="" />
                        <div className="h-full pb-3 border-[1px] bg-gray-300"></div>
                    </div>

                    <div className=''>
                        <div className='flex justify-between'>
                            <div className='flex'>
                                <p className="text-sm self-start font-semibold">{parentPost?.userId?.fullname?.toUpperCase()}</p>
                                <p className='self-start text-gray-600 mx-1'>·</p>
                                <p className='text-gray-600 text-sm self-start'>@{user?.username}</p>
                                <p className='self-start text-gray-600 mx-1'>·</p>
                                <p className='text-gray-600 text-sm'>8m</p>
                            </div>
                        </div>

                        <div className="w-full text-ellipsis line-clamp-5">
                            <p className='max-w-[560px] tracking-normal leading-tight text-[15px]'>{parentPost?.text}</p>
                            {parentPost?.mediaFiles &&
                                <div className="mt-2">
                                {parentPost?.mediaFiles.map(url => <p className="max-w-[500px] text-ellipsis overflow-hidden">{url}</p>)}
                                </div>
                            }
                        </div>

                    </div>
                </div>
                }
                {parentPost &&
                <div className="py-2 mx-4 flex gap-2">
                    <div className='w-12 flex justify-center'>
                    <div className="h-full py-4 border-[1px] bg-gray-300"></div>
                    </div>

                    <div className=''>
                        <p className="text-start text-gray-600">Replying to <span className="text-blue-500">@{parentPost?.userId?.username}</span></p>
                    </div>
                </div>
                }
                <div className="bg-white mx-4 flex items-start gap-2 mb-4">
                    <img className="h-10 w-10 mx-1 rounded-full object-cover" src={user?.avatar} alt="" />
                    <div className="w-[512px]">
                        <textarea
                            className="w-full border-2 rounded-xl px-2 py-2 text-lg"
                            rows='4'
                            type="text"
                            placeholder="what's happening?"
                            onChange={(e) => setText(e.target.value)}

                        ></textarea>
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
                                        <img className={`rounded-xl border-[1px] ${imageUrls.length > 1 ? 'w-[250px]' : 'w-fit'} h-full object-contain`} src={media.url} alt="" /> :
                                        <video className={`rounded-2xl border-[1px] ${imageUrls.length > 1 ? 'w-[250px]' : 'w-full'} h-full bg-white`}  controls>
                                            <source src={media.url}/>
                                        </video>}
                                    </div>
                                )}


                            </div>
                        }
                    </div>
                </div>


                <div className="bg-white flex absolute px-4 sticky bottom-0 w-full justify-between items-center border-t-[1px] py-2">
                    <label htmlFor="dropFile" className="cursor-pointer">
                    <svg className="w-7 h-7 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
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

                    <button className="bg-indigo-600 text-white px-4 py-1 rounded-full" onClick={uploadFiles}>Publish</button>
                </div>
                </div>
            }
        </div>
    )
}

export default CreatePost
