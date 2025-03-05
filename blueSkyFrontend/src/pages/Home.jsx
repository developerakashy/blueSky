import React, { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import axios from 'axios'
import { useUser } from '../context/userContext'
import { usePostContext } from '../context/postContext'
import { throttle } from 'lodash'
import { ring2 } from 'ldrs'
import { useSearchParams } from 'react-router-dom'
import { useFollowingPostContext } from '../context/followingPost'

ring2.register()

function Home(){
    const [searchParams, setSearchParams] = useSearchParams()
    const active = (searchParams.get('section') === 'following') ? 'following' : 'all'

    const { posts, setPosts, hasMorePosts, setHasMorePosts} = usePostContext()
    const {followingPosts, setFollowingPosts, hasMoreFollowingPosts, setHasMoreFollowingPosts} = useFollowingPostContext()

    const [page, setPage] = useState((posts?.length / 10) + 1) //good but needs urgent update
    const [followingPostsPage, setFollowingPostsPage] = useState((followingPosts?.length / 10) + 1) //good but needs urgent update

    const [loading, setLoading] = useState(false)
    const [activeSection, setActiveSection] = useState(active)

    const fetchPosts = async (currentPage) => {
        if(loading) return

        console.log('request accepted for page ', currentPage)
        setLoading(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/all?page=${currentPage}`, {withCredentials: true})
            console.log(data)

            if(data.data.length > 0){
                setPosts(prev => [...prev, ...data.data])
                setPage(prev => prev + 1)

            }else {
                setHasMorePosts(false)
            }



        } catch (error) {
            console.log(error)

        } finally {
            setLoading(false)

        }
    }

    const fetchFollowingPosts = async (currentPage) => {
        if(loading) return

        console.log('request accepted for page ', currentPage)
        setLoading(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/following?page=${currentPage}`, {withCredentials: true})
            console.log(data.data)

            if(data?.data?.length > 0){
                setFollowingPosts(prev => [prev, ...data.data])
                setFollowingPostsPage(prev => prev + 1)
                if(data?.data?.length < 10) setHasMoreFollowingPosts(false)

            } else {
                setHasMoreFollowingPosts(false)
            }

        } catch (error) {
            console.log(error?.response)

        }finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const handleScroll = throttle(() => {
            if((document.documentElement.scrollTop + window.innerHeight) > (document.documentElement.offsetHeight - 50)){

                if(hasMorePosts){
                    console.log('send request')
                    fetchPosts(page)
                }
            }

        }, 500)


        if(activeSection === 'all'){
            if(posts.length === 0){
                fetchPosts(page)
            }
            window.addEventListener('scroll', handleScroll)
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [page, hasMorePosts, activeSection])

    useEffect(() => {

        const handleScroll = throttle(() => {
            if((document.documentElement.scrollTop + window.innerHeight) > (document.documentElement.offsetHeight - 50)){

                if(hasMoreFollowingPosts){
                    console.log('send request')
                    fetchFollowingPosts(followingPostsPage)
                }
            }
        }, 500)


        if(activeSection === 'following'){
            if(followingPosts.length === 0){
                fetchFollowingPosts(followingPostsPage)
            }
            window.addEventListener('scroll', handleScroll)
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }

    }, [followingPostsPage, hasMoreFollowingPosts, activeSection])

    const handleSectionChange = (section) => {
        setSearchParams({section})
        setActiveSection(section)
    }

    return(
        <div className='w-full'>
            <div className='h-12 border-b border-slate-200 flex sticky top-0 bg-white z-30'>
                <button onClick={() => handleSectionChange('all')} className={`cursor-pointer w-full ${activeSection === 'all' ? 'border-b-3 border-blue-500 font-bold' : ''} hover:bg-slate-100`}>All</button>
                <button onClick={() => handleSectionChange('following')} className={`cursor-pointer w-full ${activeSection === 'following' ? 'border-b-3 border-blue-500 font-bold' : ''} hover:bg-slate-100`}>Following</button>
            </div>
            {(activeSection === 'all' && posts.length > 0) && posts.map(post => post?._id &&
                <PostCard key={post._id} post={post}/>
            )}

            {(activeSection === 'following' && followingPosts.length > 0) && followingPosts.map(post => post?._id &&
                <PostCard key={post._id} post={post}/>
            )}
            {(hasMorePosts && activeSection === 'all')
                && <div className='p-4 flex justify-center'>
                <l-ring-2
                  size="32"
                  stroke="4"
                  stroke-length="0.25"
                  bg-opacity="0.1"
                  speed="0.8"
                  color="blue"
                ></l-ring-2>
            </div>}

            {(hasMoreFollowingPosts && activeSection === 'following')
                && <div className='p-4 flex justify-center'>
                <l-ring-2
                  size="32"
                  stroke="4"
                  stroke-length="0.25"
                  bg-opacity="0.1"
                  speed="0.8"
                  color="blue"
                ></l-ring-2>
            </div>}



        </div>

    )
}

export default Home
