import axios from "axios"
import { useEffect, useState } from "react"
import PostCard from "./PostCard"

function Reposted(){
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)


    const fetchMostRepostedPost = async (page) => {
        if (loading) return

        setLoading(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/most_reposted?page=${page}`, {withCredentials:true})
            console.log(data.data)

            if(data?.data?.length > 0){
                setPosts(prev => [...data?.data])

            }

        } catch (error) {
            console.log(error)

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        if(posts.length === 0){
            fetchMostRepostedPost(1)
        }

    }, [])

    return(

        <div>
            <p className="font-bold px-4 py-2">Most Reposted</p>
            {posts.length > 0 &&
                posts.map(post => <PostCard key={post?._id} post={post}/>)
            }

        </div>
    )
}

export default Reposted
