import React from 'react'
import { useUser } from '../context/userContext'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { usePostContext } from '../context/postContext'
import { Bell, Bookmark, Cloudy, House, LogOut, MessageCircle, Search, UserRound } from 'lucide-react'

function Nav(){
    const {user, setPublishPost, logout} = useUser()
    const {pathname} = useLocation()
    console.log(pathname)
    const navigate = useNavigate()
    const {setPosts} = usePostContext()

    return(
        <div className='md:h-full md:flex md:flex-col md:justify-between md:w-full md:max-w-[310px] md:mr-2'>
            <div className='fixed py-2 flex justify-between bottom-0 left-0 right-0 bg-white z-20 md:py-auto md:block md:relative md:mt-6'>
                <button onClick={() => navigate('/')} className='hidden md:block md:cursor-pointer md:px-5 md:mb-4'>
                    <Cloudy strokeWidth='2' className='h-8 w-8 fill-blue-400 stroke-blue-500'/>
                </button>

                <button className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink
                    preventScrollReset
                    to='/'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <House className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Home</p>
                            </div>
                        }
                    </NavLink>
                </button>

                <button className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink
                    preventScrollReset
                    to='/explore'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Search className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Explore</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button  className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink to='/notifications'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Bell className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Notifications</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink to='/chat'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <MessageCircle className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Chats</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink to={`/user/${user?.username}`}>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <UserRound className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Profile</p>
                            </div>
                        }
                    </NavLink>
                </button>
                <button className='cursor-pointer group md:w-full md:block flex justify-center items-center max-w-16 min-w-14'>
                    <NavLink to='/bookmarks'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 p-2 md:p-4 md:pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <Bookmark className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`hidden md:block text-xl ${isActive ? 'font-bold' : ''}`}>Bookmarks</p>
                            </div>
                        }
                    </NavLink>
                </button>
                {/* <button className='cursor-pointer group w-full px-2'>
                    <NavLink to='/setting'>
                        {({isActive}) =>
                            <div className='flex items-center gap-2 px-4 py-4 pr-12 w-min rounded-full group-hover:bg-slate-100'>
                                <CircleEllipsis className={`${isActive ? 'stroke-3' : ''}`}/>
                                <p className={`text-xl ${isActive ? 'font-bold' : ''}`}>More</p>
                            </div>
                        }
                    </NavLink>
                </button> */}
                <div className='hidden md:block px-2 py-2 '>
                    <button onClick={() => setPublishPost({publish: true, setPosts})} className='cursor-pointer w-full text-xl font-semibold text-white bg-blue-600 px-2 py-3 rounded-full'>Post</button>
                </div>
            </div>


            {user?.username &&
            <div className='hidden py-2 px-2 mx-2  rounded-full hover:bg-slate-100 mb-4 md:flex justify-between items-center'>

                <div className='flex items-center'>
                    {!user?.avatar ?
                        <div className='mr-2 h-12 w-12 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                            <UserRound className='h-6 w-6 stroke-gray-600 rounded-full'/>
                        </div> :

                        <img className='mr-2 block h-12 w-12 rounded-full object-cover' src={user?.avatar} alt="" />
                    }
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
                <div className='mx-2 hidden md:flex gap-2 justify-center mb-12'>
                    <button className='bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700' onClick={() => navigate('/auth/login')} >Login</button>
                    <button className='bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700' onClick={() => navigate('/auth/registration')} >Signup</button>
                </div>
            }

            {/* mobile responsive */}
            {pathname === '/' &&
                <div className='md:hidden border-r border-slate-200 z-40 flex justify-between sticky top-0 p-1'>
                    {user?.username ?
                        <div onClick={() => navigate(`/user/${user?.username}`)} className='cursor-pointer p-2 max-w-12 w-12 rounded-full hover:bg-slate-200/50'>
                            {!user?.avatar ?
                                <div className='mr-2 h-8 w-8 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                                    <UserRound className='h-4 w-4 stroke-gray-600 rounded-full'/>
                                </div> :

                                <img className='mr-2 block h-8 w-8 rounded-full object-cover' src={user?.avatar} alt="" />
                            }
                        </div> :
                        <div className='p-2 max-w-12 w-12 rounded-full'>

                        </div>
                    }

                    <button onClick={() => navigate('/')} className='cursor-pointer max-w-12 w-12 flex justify-center items-center md:cursor-pointer md:px-5 md:mb-4'>
                        <Cloudy strokeWidth='2' className='h-8 w-8 fill-blue-400 stroke-blue-500'/>
                    </button>

                    <div className='max-w-12 w-12 flex justify-center items-center'>
                        {user?.username ?
                            <LogOut onClick={logout} className='cursor-pointer stroke-red-500 w-8 h-8 p-2 bg-red-200/50 hover:bg-red-200 rounded-full'/> :
                                <button className='cursor-pointer hover:bg-indigo-700 text-white rounded-full p-1 px-3 bg-indigo-600 mr-8' onClick={() => navigate('/auth/login')}>Login</button>

                        }
                    </div>
                </div>
            }


        </div>
    )
}

export default Nav
