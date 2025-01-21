import React from 'react'
import { Outlet } from 'react-router'
import Nav from '../components/Nav'
import { useUser } from '../context/userContext'
import CreatePost from '../components/CreatePost'

function Layout(){
    const {publishPost, setPublishPost} = useUser()


    return (
        <div className='flex justify-center'>
            {publishPost?.publish && <CreatePost setPosts={publishPost?.setPosts} parentPost={publishPost.parentPost} setPublishPost={setPublishPost}/>}
            <div className='sticky top-0 border-l-[1px] h-screen w-[270px]'>
                <Nav/>
            </div>
            <Outlet/>
            <div className='sticky top-0 border-r-[1px] w-[380px] h-screen'>
                Bottom
            </div>
        </div>
    )
}

export default Layout
