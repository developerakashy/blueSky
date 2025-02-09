import React from 'react'
import { useUser } from '../context/userContext'
import { NavLink, useNavigate } from 'react-router'
import { usePostContext } from '../context/postContext'
import { Bell, Bookmark, CircleEllipsis, Ellipsis, Hash, House, MessageCircle, Rainbow, Search, UserRound } from 'lucide-react'

function Nav(){
    const {user, setPublishPost, logout} = useUser()
    const navigate = useNavigate()
    const {setPosts} = usePostContext()

    return(
        <div className='h-full flex flex-col justify-between w-full max-w-[310px] mr-2'>
            <div className='mt-6'>
                <button onClick={() => navigate('/')} className='cursor-pointer px-5 mb-4'>
                    <Hash strokeWidth='1.5' className='h-8 w-8'/>
                </button>

                <button className='cursor-pointer group w-full px-2'>
                    <NavLink
                    preventScrollReset
                    to='/'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <House className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Home</p>
                            </div>
                        }
                    </NavLink>
                </button>

                <button className='cursor-pointer group w-full px-2'>
                    <NavLink
                    preventScrollReset
                    to='/explore'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Search className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Explore</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button  className='cursor-pointer group w-full px-2'>
                    <NavLink to='/notifications'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Bell className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Notifications</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group w-full px-2'>
                    <NavLink to='/chat'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <MessageCircle className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Chat</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group w-full px-2'>
                    <NavLink to={`/user/${user?.username}`}>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <UserRound className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Profile</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group w-full px-2'>
                    <NavLink to='/bookmarks'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Bookmark className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>Bookmarks</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group w-full px-2'>
                    <NavLink to='/setting'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <CircleEllipsis className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>More</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <div className='px-2 py-2 '>
                    <button onClick={() => setPublishPost({publish: true, setPosts})} className='cursor-pointer w-full text-xl font-semibold text-white bg-blue-600 px-2 py-3 rounded-full'>Post</button>
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
