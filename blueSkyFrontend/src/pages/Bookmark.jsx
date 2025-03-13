import axios from "axios"
import { useEffect, useState } from "react"
import PostCard from "../components/PostCard"
import { useUser } from "../context/userContext"
import { UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

function Bookmark(){
    const {user} = useUser()
    const navigate = useNavigate()
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
            <div className="p-1 md:p-3 flex items-center gap-2 sticky top-0 border-r border-b border-slate-200 bg-white/70 backdrop-blur-sm z-10">
                {
                    user?.username &&
                    <div onClick={() => navigate(`/user/${user?.username}`)} className='md:hidden cursor-pointer p-2 max-w-12 w-12 rounded-full hover:bg-slate-200/50'>
                        {!user?.avatar ?
                            <div className='mr-2 h-8 w-8 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                                <UserRound className='h-4 w-4 stroke-gray-600 rounded-full'/>
                            </div> :

                            <img className='mr-2 block h-8 w-8 rounded-full object-cover' src={user?.avatar} alt="" />
                        }
                    </div>
                }
                <p className="text-xl font-bold">Bookmarks</p>
            </div>

            {posts && posts.map(post => post?._id && <PostCard key={post?._id} post={post} />)}
        </div>
    )
}

export default Bookmark
