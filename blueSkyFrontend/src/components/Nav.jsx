import React from 'react'
import { useUser } from '../context/userContext'
import { useNavigate } from 'react-router'
import { usePostContext } from '../context/postContext'

function Nav(){
    const {user, setPublishPost, logout} = useUser()
    const navigate = useNavigate()
    const {setPosts} = usePostContext()

    return(
        <div className='h-full flex flex-col justify-between'>
            <div className='mt-20'>
                <button onClick={() => navigate('/')} className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Home</p>
                </button>
                <button className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Explore</p>
                </button>
                <button className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Notifications</p>
                </button>
                <button className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Chat</p>
                </button>
                <button onClick={() => navigate(`/user/${user?.username}`)} className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Profile</p>
                </button>
                <button className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>Bookmark</p>
                </button>
                <button className='group w-full px-2'>
                    <p className='text-start text-xl px-4 py-3 pr-12 w-min rounded-full group-hover:bg-slate-100'>More</p>
                </button>
                <div className='px-2 py-2'>
                    <button onClick={() => setPublishPost({publish: true, setPosts})} className='w-full text-xl font-semibold text-white bg-blue-400 px-2 py-3 rounded-full'>Post</button>
                </div>
            </div>


            {user?.username &&
            <div className='py-2 px-2 mx-2 rounded-full hover:bg-slate-100 mb-4 flex justify-between items-center'>

                <div className='flex'>
                    <img className='mr-2 block h-12 w-12 object-cover rounded-full' src={user?.avatar} alt="" />
                    <div>
                        <p className='font-bold text-sm'>{user?.fullname.toUpperCase()}</p>
                        <p className='text-sm'>@{user?.username}</p>
                    </div>
                </div>

                <div>
                    <button className='py-2 px-3 mr-1 bg-red-200 text-xs font-semibold rounded-full' onClick={logout}>Logout</button>
                </div>
            </div>
            }

            {!user?.username &&
                <div className='mx-2 flex gap-2 justify-center mb-12'>
                    <button className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700' onClick={() => navigate('/auth/login')} >Login</button>
                    <button className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700' onClick={() => navigate('/auth/registration')} >Signup</button>
                </div>
            }
        </div>
    )
}

export default Nav
