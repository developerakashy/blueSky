import React, { useState } from "react"
import { useUser } from "../context/userContext"
import axios from "axios"
import { Image, UserRound, X } from "lucide-react"
import toast from "react-hot-toast"

function EditProfile({setEdit, setUser, user}){

    const {setLoading} = useUser()
    const [fullname, setFullname] = useState(user?.fullname)
    const [about, setAbout] = useState(user?.about || '')

    const [coverImageFile, setCoverImageFile] = useState(null)
    const [avatarImageFile, setAvatarImageFile] = useState(null)

    const [coverImageUrl, setCoverImageUrl] = useState(null)
    const [avatarImageUrl, setAvatarImageUrl] = useState(null)


    const handleFileInput = (e) => {
        const File = e.target.files[0]

        console.log(e.target.files[0])
        const imageUrl = URL.createObjectURL(File)

        if(e.target.name === 'coverImage'){

            setCoverImageFile(File)
            setCoverImageUrl(imageUrl)

        } else {

            setAvatarImageFile(File)
            setAvatarImageUrl(imageUrl)
        }

    }

    const handleProfileUpdate = async () => {

        const formData = new FormData()

        if(fullname?.toUpperCase()?.trim() !== user?.fullname?.toUpperCase()?.trim()) formData.append('fullname', fullname)
        if(about?.trim() !== user?.about?.trim()) formData.append('about', about)
        if(coverImageFile?.name) formData.append('coverImage', coverImageFile)
        if(avatarImageFile?.name) formData.append('avatarImage', avatarImageFile)

        setLoading(true)
        try {

            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/update-profile`, formData, {withCredentials: true})
            console.log(data?.data)
            setUser(prev => ({...prev, ...data?.data}))
            toast.success('Profile updated successfully')
            setEdit(false)


        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setLoading(false)

        }
    }


    return(
        <div className="fixed z-40 h-screen left-0 w-screen bg-black/50 flex justify-center items-center">
          <div className="z-10 w-[600px] h-[80%] bg-white rounded-xl">
                <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                    <div className="flex gap-2 items-center">
                        <X strokeWidth={2.5} onClick={() => setEdit(false)} className="cursor-pointer left-3 top-3 p-1 rounded-full stroke-slate-700 bg-black stroke-white hover:bg-red-500 h-6 w-6"/>

                        {/* <button onClick={() => setEdit(false)} className="px-2 border-2">close</button> */}
                        <p className="font-bold text-lg ml-2">Edit Profile</p>
                    </div>

                    <button onClick={handleProfileUpdate} className="cursor-pointer bg-blue-500 text-white px-4 h-min py-1 rounded-full">Save</button>
                </div>

                <div className="relative">
                    <div className="h-52 w-full relative">
                        {!user?.coverImage && !coverImageUrl ?
                            <div className="block h-56 w-full flex justify-center items-center bg-slate-100">
                                <Image className="h-12 w-12 stroke-gray-500"  />
                            </div> :

                            // <img className="block h-56 w-full object-cover" src={user?.coverImage} alt="" />
                            <img className="block h-52 w-full object-cover" src={coverImageUrl ? coverImageUrl : user?.coverImage} alt="" />
                        }
                        <div className="absolute inset-0 flex justify-center items-center">
                            <label htmlFor="coverImage" className="cursor-pointer">
                                <svg className="w-12 h-12 p-3 rounded-full backdrop-blur-xs text-gray-500 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                            </label>
                        </div>
                        <input
                            className="hidden"
                            type="file"
                            name="coverImage"
                            accept="image/jpeg, image/png, image/webp"
                            id='coverImage'
                            onChange={(e) => handleFileInput(e)}
                        />
                    </div>
                    <div className="border-[6px] border-white mx-4 block h-32 w-32 absolute bottom-[-64px] rounded-full">
                        {!user?.avatar && !avatarImageUrl ?
                            <div className="flex justify-center items-center bg-slate-100 border-white block h-full w-full rounded-full">
                                <UserRound className="h-12 w-12 stroke-gray-600" />
                            </div> :

                            // <img className="border-[6px] border-white mx-4 block h-32 w-32 absolute bottom-[-64px] rounded-full object-cover" src={user?.avatar} alt="" />
                            <img className="h-full w-full object-cover rounded-full" src={avatarImageUrl ? avatarImageUrl : user?.avatar} alt="" />
                        }

                        <div className="absolute inset-0 flex rounded-full justify-center items-center">
                            <label htmlFor="avatarImage" className="cursor-pointer">
                                <svg className="w-12 h-12 p-3 rounded-full backdrop-blur-xs text-gray-500 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                            </label>
                        </div>
                        <input
                            className="hidden"
                            type="file"
                            name="avatarImage"
                            accept="image/jpeg, image/png, image/webp"
                            id='avatarImage'
                            onChange={(e) => handleFileInput(e)}
                        />
                    </div>
                </div>

                <div className="mt-20 px-4">
                    <div className="relative">
                        <input type="text" id="name_text" value={fullname?.toUpperCase()} onChange={(e) => setFullname(e.target.value)} className="block rounded-lg px-2.5 pb-1.5 pt-5 w-full text-lg text-gray-900 border-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label htmlFor="name_text" className="absolute text-base text-gray-600 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Name</label>
                    </div>

                    <div className="relative mt-2">
                        <textarea type="text" id="about_text" value={about} onChange={(e) => setAbout(e.target.value)}  className="block rounded-lg px-2.5 pb-1.5 pt-5 w-full text-lg text-gray-900 border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " rows='3' ></textarea>
                        <label htmlFor="about_text" className="absolute text-base text-gray-600 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">About</label>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default EditProfile
