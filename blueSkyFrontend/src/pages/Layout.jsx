import React from 'react'
import { Outlet } from 'react-router'
import Nav from '../components/Nav'
import { useUser } from '../context/userContext'
import CreatePost from '../components/CreatePost'
import SocketConnection from './SocketConnection'
import { ToastContainer } from 'react-toastify'

function Layout(){
    const {publishPost, setPublishPost, setNotifications} = useUser()

    return (
        <div className='flex justify-center'>
            <SocketConnection setNotifications={setNotifications}/>
            {publishPost?.publish && <CreatePost setPosts={publishPost?.setPosts} parentPost={publishPost.parentPost} setPublishPost={setPublishPost}/>}
            <div className='hidden md:flex sticky top-0 h-screen w-full justify-end max-w-[450px]'>
                <Nav/>
            </div>
            <div className='sm:min-w-[650px] max-w-[650px] border-x-1 border-slate-200'>
                <Outlet/>
            </div>
            <div className='hidden lg:block sticky top-0 border-r-[1px] w-full max-w-[450px] h-screen'>
                Bottom
            </div>


        </div>
    )
}

export default Layout
