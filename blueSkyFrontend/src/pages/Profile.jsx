import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/userContext";
import usePosts from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import { useParams } from "react-router";
import axios from "axios";
import EditProfile from "../components/EditProfile";

function Profile(){
    const { user: userLoggedIn } = useUser()
    const { username } = useParams()
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [edit, setEdit] = useState(false)
    console.log(username)

    // const queryParams = useMemo(() => ({userId: user?._id}), [user])
    // const {posts, loading, error} = usePosts(queryParams)

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const { data } = await axios.get(`http://localhost:8003/user/${username}`, {withCredentials: true})
                console.log(data)
                setPosts(data.data.userPosts)
                setUser(data.data.userInfo)
                setLoading(false)
            } catch (error) {
                console.log(error)
            }
        }

        fetchUserInfo()

    }, [])


    useEffect(() => {
        if(edit){
            document.body.style = 'overflow: hidden'
        } else {
            document.body.style = 'overflow: auto'
        }
    }, [edit])


    return(
        <div className="w-[600px] border-x-[1px]">
            {edit && <EditProfile setEdit={setEdit}/>}
            <div className='sticky z-10 top-0 bg-white flex items-center p-2'>
                <button className='px-4 rounded-full mr-6'><img className='h-4' src="../../.././back.png" alt="" /></button>
                <div>
                    <p className='font-semibold'>{user?.fullname?.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">100 posts</p>
                </div>
            </div>

            <div>
                <div className="relative">
                    <img className="block h-52 w-full object-cover" src={user?.coverImage} alt="" />
                    <img className="border-[6px] border-white mx-4 block h-32 w-32 absolute bottom-[-64px] rounded-full object-cover" src={user?.avatar} alt="" />
                </div>

                <div className="text-end px-4 py-3">
                    {userLoggedIn?.username === username && <button onClick={() => setEdit(true)} className="rounded-full px-4 py-2 bg-stone-200 mr-2">Edit</button>}
                    <button className="rounded-full px-4 py-2 bg-blue-500 text-white">follow</button>
                </div>

                <div className="px-4">
                    <p className="font-bold text-2xl">{user?.fullname?.toUpperCase()}</p>
                    <p className="text-gray-500 text-lg leading-tight">@{user?.username}</p>
                    <p className="mt-2 leading-tight text-[15px]">{user?.about}</p>
                    <p className="text-gray-500 mt-2 text-[15px]">Joined October 2023</p>

                    <div className="mt-2 flex gap-4">
                        <button className="hover:underline text-gray-500 text-[15px]"><span className="font-semibold text-black">129</span> Following</button>
                        <button className="hover:underline text-gray-500 text-[15px]"><span className="font-semibold text-black">100</span> Followers</button>
                    </div>

                </div>

            </div>

            <div className="border-b-[1px] mt-3 flex">
                <button className="w-full px-4 py-4 hover:bg-gray-100">Posts</button>
                <button className="w-full px-4 py-4 hover:bg-gray-100">Replies</button>
                <button className="w-full px-4 py-4 hover:bg-gray-100">Likes</button>
            </div>

            <div>
                {loading && <p className="h-screen mb-12">'Loading...'</p>}
                {posts && posts.map((post) =>
                    <PostCard key={post._id} post={post}/>
                )}
            </div>
        </div>
    )
}

export default Profile
