import React from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Nav from '../components/Nav'
import { useUser } from '../context/userContext'
import CreatePost from '../components/CreatePost'
import SocketConnection from './SocketConnection'
import { ToastContainer } from 'react-toastify'
import Search from '../components/Search'
import UserRecommend from '../components/UserRecommend'

function Layout(){
    const {publishPost, setPublishPost, setNotifications} = useUser()

    return (
        <div className='flex justify-center'>
            <ScrollRestoration/>

            <SocketConnection setNotifications={setNotifications}/>

            {publishPost?.publish &&
                <CreatePost
                    setPosts={publishPost?.setPosts}
                    parentPost={publishPost.parentPost}
                    setPublishPost={setPublishPost}
                />
            }

            <div className='md:flex md:sticky md:top-0 md:h-screen md:w-full md:justify-end md:max-w-[450px]'>
                <Nav/>
            </div>

            <div className='sm:min-w-[650px] w-full max-w-[650px] border-x border-slate-200'>
                <Outlet/>
            </div>

            <div className='hidden lg:block sticky top-0 w-full max-w-[450px] h-screen'>
                <Search/>
                <UserRecommend/>
            </div>


        </div>
    )
}

export default Layout
