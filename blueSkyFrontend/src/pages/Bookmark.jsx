import axios from "axios"
import { useEffect, useState } from "react"
import PostCard from "../components/PostCard"

function Bookmark(){
    const [posts, setPosts] = useState([])

    useEffect(() => {

        const fetchUserBookmark = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/bookmark`, {withCredentials: true})

                setPosts(data.data)
                console.log(data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchUserBookmark()


    }, [])


    return(
        <div className="w-full pb-186">
            <div className="p-3 sticky top-0 border-r border-b border-slate-200 bg-white z-10">
                <p className="text-xl font-bold">Bookmarks</p>
            </div>

            {posts && posts.map(post => post?._id && <PostCard key={post?._id} post={post} />)}
        </div>
    )
}

export default Bookmark
