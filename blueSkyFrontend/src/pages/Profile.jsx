import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../context/userContext";
import usePosts from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import EditProfile from "../components/EditProfile";

function Profile(){
    const { user: userLoggedIn } = useUser()
    const { username } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState({posts: [], replies: [], userLiked: []})
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [edit, setEdit] = useState(false)
    const [activeSection, setActiveSection] = useState('posts')

    const [followed, setFollowed] = useState(user?.userFollowed)
    const [followerCount, setFollowerCount] = useState(user?.followerCount)
    let wasFollowedRef = useRef(user?.userFollowed)
    let followTimeoutRef = useRef()


    const renderPost = () => {
        switch(activeSection){
            case 'posts':
                return data.posts.map((post) => <PostCard key={post._id} post={post}/>);
            case 'replies':
                return data.replies.map((post) => <PostCard key={post._id} post={post}/>);
            case 'userLiked':
                return data.userLiked.map((post) => <PostCard key={post._id} post={post}/>);
            default:
                return null
        }
    }

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const { data: userInfo } = await axios.get(`http://localhost:8003/user/${username}`, {withCredentials: true})
                const { data } = await axios.get(`http://localhost:8003/post/${username}/posts`, {withCredentials: true})
                setUser(userInfo.data)
                setData({posts: data.data.posts, replies: data.data.replies, userLiked: data.data.liked })
                setLoading(false)
                console.log(data)
            } catch (error) {
                console.log(error);
            }
        }

        fetchUserInfo()
        document.body.scrollTo(0, 0)
    }, [username])


    useEffect(() => {
        if(edit){
            document.body.style = 'overflow: hidden'
        } else {
            document.body.style = 'overflow: auto'
        }
    }, [edit])

    useEffect(() => {
        wasFollowedRef.current = user?.userFollowed
        setFollowed(user?.userFollowed)
        setFollowerCount(user?.followerCount)
    }, [user])


    const handleFollow = () => {
        if(followTimeoutRef.current){
            clearTimeout(followTimeoutRef.current)

        }
        setFollowed(prev => !prev)
    }


    useEffect(() => {

        const toggleFollow = async () => {
            try {
                const { data } = await axios.post(`http://localhost:8003/follow/${user?._id}`, {}, {withCredentials:true})
                console.log(data)
                return data?.data?.userIdArray?.length
            } catch (error) {
                console.log(error)
            }
        }

        console.log(followed, wasFollowedRef)
        followTimeoutRef.current = setTimeout(async () => {
            if(followed !== wasFollowedRef.current && user){
                const res = await toggleFollow()
                wasFollowedRef.current = followed
                setFollowerCount(prev => followed ? prev + 1 : prev - 1)
                console.log('request made')
            }
        }, 500)

    }, [followed])


    return(
        <div className="w-full">
            {edit && <EditProfile setEdit={setEdit} user={user} setUser={setUser}/>}
            <div className='fixed z-10 top-0 flex justify-center items-center'>
                <button onClick={() => navigate(-1)} className='cursor-pointer p-2 backdrop-blur-md bg-black/10 rounded-full ml-2 mt-2 rounded-full'><img className='h-4' src="../../.././back.png" alt="" /></button>
                {/* <div>
                    <p className='font-semibold'>{user?.fullname?.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{data.posts?.length} Posts | {data.replies?.length} Replies | {data.userLiked?.length} Posts Liked</p>
                </div> */}
            </div>

            <div>
                <div className="relative">
                    <img className="block p-1 rounded-3xl h-56 w-full object-cover" src={user?.coverImage} alt="" />
                    <img className="border-[6px] border-white mx-4 block h-32 w-32 absolute bottom-[-64px] rounded-full object-cover" src={user?.avatar} alt="" />
                </div>

                <div className="text-end px-4 py-3">
                    { userLoggedIn?.username === username ? <button onClick={() => setEdit(true)} className="cursor-pointer rounded-full px-4 py-2 bg-stone-200 mr-2">Edit profile</button> :
                    <button onClick={handleFollow} className={`cursor-pointer rounded-full px-4 py-2 border-[1px] font-bold border-gray-200 ${followed ? ' text-black hover:bg-red-200 hover:text-red-600 hover:border-red-300' : 'bg-black text-white'}`}>{followed ? 'unfollow' : 'follow'}</button> }
                </div>

                <div className="px-4">
                    <p className="font-bold text-2xl">{user?.fullname?.toUpperCase()}</p>
                    <p className="text-gray-500 text-lg leading-tight">@{user?.username}</p>
                    <p className="mt-2 leading-tight text-[15px]">{user?.about}</p>
                    <p className="text-gray-500 mt-2 text-[15px]">Joined October 2023</p>

                    <div className="mt-2 flex gap-4">
                        <button onClick={() => navigate('followers')} className="hover:underline text-gray-500 text-[15px]"><span className="font-semibold text-black">{followerCount}</span> Followers</button>
                        <button onClick={() => navigate('followings')} className="hover:underline text-gray-500 text-[15px]"><span className="font-semibold text-black">{user?.followingCount}</span> Followings</button>
                    </div>

                </div>

            </div>

            <div className="border-b-[1px] mt-3 flex">
                <button onClick={() => setActiveSection('posts')} className={`w-full px-4 py-4 hover:bg-gray-100 font-semibold ${activeSection === 'posts' ? 'text-black' : 'text-gray-500'}`}>Posts</button>
                <button onClick={() => setActiveSection('replies')} className={`w-full px-4 py-4 hover:bg-gray-100 font-semibold ${activeSection === 'replies' ? 'text-black' : 'text-gray-500'}`}>Replies</button>
                <button onClick={() => setActiveSection('userLiked')} className={`w-full px-4 py-4 hover:bg-gray-100 font-semibold ${activeSection === 'userLiked' ? 'text-black' : 'text-gray-500'}`}>Likes</button>
            </div>

            <div className="pb-128">
                {loading && <p className="h-screen mb-12">'Loading...'</p>}
                {renderPost()}
            </div>
        </div>
    )
}

export default Profile
