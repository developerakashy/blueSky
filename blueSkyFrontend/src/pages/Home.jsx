import React, { Children, memo, useEffect, useMemo, useState } from 'react'
import PostCard from '../components/PostCard'
import axios from 'axios'
import { ScrollRestoration } from 'react-router'
import CreatePost from '../components/CreatePost'
import { useUser } from '../context/userContext'
import { usePostContext } from '../context/postContext'
import DirectMessage from './DirectMessage'

function Home(){
    const {publishPost, setPublishPost} = useUser()
    const [page, setPage] = useState(1)
    const { posts, setPosts} = usePostContext()
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await axios.get('http://localhost:8003/post/', {withCredentials: true})
                console.log(data.data)
                setLoading(false)
                setPosts(data.data)
            } catch (error) {
                console.log(error.response.data.message)
            }
        }

        if(!posts.length){
            fetchPosts()
        }else{
            setLoading(false)
        }

    }, [page])


    return(
        <div className='w-[600px] border-x-[1px]'>
            
            {loading && <p className='h-screen'>Loading...</p>}
            {posts.length > 0 && posts.map(post => post?._id &&
                <PostCard key={post._id} post={post}/>
            )}
        </div>

    )
}

export default Home
