import React from 'react'
import { Outlet } from 'react-router'
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
            <SocketConnection setNotifications={setNotifications}/>
            {publishPost?.publish && <CreatePost setPosts={publishPost?.setPosts} parentPost={publishPost.parentPost} setPublishPost={setPublishPost}/>}
            <div className='hidden md:flex sticky top-0 h-screen w-full justify-end max-w-[450px]'>
                <Nav/>
            </div>
            <div className='sm:min-w-[650px] w-full max-w-[650px] border-x-1 border-slate-200'>
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
