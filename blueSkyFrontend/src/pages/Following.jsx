import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserCard from "../components/UserCard";

function FollowingsAndFollowers(){
    const { username } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const path = location.pathname.split('/').pop()

    const [user, setUser] = useState(null)
    const [followers, setFollowers] = useState([])
    const [followings, setFollowings] = useState([])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/${username}`, {withCredentials: true})
                console.log(data)
                setUser(data.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchUser()
    }, [username])

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/follow/followers/${user?._id}`,{withCredentials: true})
                console.log(data)
                setFollowers(data.data)
            } catch (error) {
                console.log(error)
            }
        }

        const fetchFollowings = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/follow/followings/${user?._id}`, {withCredentials: true})
                console.log(data)
                setFollowings(data.data)
            } catch (error) {
                console.log(error)
            }
        }

        if(user){
            fetchFollowers()
            fetchFollowings()
        }

    }, [user])

    return (
        <div className="w-full">
            <div className='sticky z-10 top-0 bg-white'>
                <div className="flex items-center p-2">
                    <button onClick={() => navigate(-1)} className='px-4 rounded-full mr-6'><img className='cursor-pointer h-4' src="../../.././back.png" alt="" /></button>
                    <div>
                        <p className='font-semibold'>{user?.fullname?.toUpperCase()}</p>
                        <p className="text-sm text-gray-500">@{user?.username}</p>
                    </div>
                </div>

                <div className="border-b border-slate-200 flex">
                    <button onClick={() => navigate(`/user/${username}/followers`)} className={`cursor-pointer w-full p-3 hover:bg-gray-100 font-semibold ${path === 'followers' ? 'text-black' : 'text-gray-500'}`}>Followers</button>
                    <button onClick={() => navigate(`/user/${username}/followings`)} className={`cursor-pointer w-full p-3 hover:bg-gray-100 font-semibold ${path === 'followings' ? 'text-black' : 'text-gray-500'}`}>Followings</button>
                </div>
            </div>

            {path === 'followers' && followers.map(user => <UserCard key={user?._id} user={user}/>)}
            {path === 'followings' && followings.map(user => <UserCard key={user?._id} user={user}/>)}

        </div>
    )
}

export default FollowingsAndFollowers
