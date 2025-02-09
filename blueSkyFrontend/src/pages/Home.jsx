import React, { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import axios from 'axios'
import { useUser } from '../context/userContext'
import { usePostContext } from '../context/postContext'
import { throttle } from 'lodash'
import { ring2 } from 'ldrs'

ring2.register()

function Home(){
    const { posts, setPosts, hasMorePosts, setHasMorePosts} = usePostContext()
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)


    const fetchPosts = async (currentPage) => {
        if(loading) return

        console.log('request accepted')
        setLoading(true)
        try {
            const { data } = await axios.get(`http://localhost:8003/post/all?page=${currentPage}`, {withCredentials: true})
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




    useEffect(() => {
        const handleScroll = throttle(() => {
            if((document.documentElement.scrollTop + window.innerHeight) > (document.documentElement.offsetHeight - 50)){

                if(hasMorePosts){
                    console.log('send request')
                    fetchPosts(page)
                }
            }

        }, 500)

        if(posts.length === 0){
            fetchPosts(page)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [page, hasMorePosts])


    return(
        <div className='w-full'>

            {posts.length > 0 && posts.map(post => post?._id &&
                <PostCard key={post._id} post={post}/>
            )}
            {hasMorePosts && <div className='p-4 flex justify-center'>
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
