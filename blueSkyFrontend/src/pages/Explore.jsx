import axios from "axios"
import { throttle } from "lodash"
import { useEffect, useState } from "react"
import PostCard from "../components/PostCard"
import Reposted from "../components/Reposted"
import { useUser } from "../context/userContext"
import { UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

function Explore(){
    const {user} = useUser()
    const navigate = useNavigate()
    const [searchStr, setSearchStr] = useState('')
    const [page, setPage] = useState(1)
    const [hasMorePosts, setHasMorePosts] = useState(true)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSearch, setShowSearch] = useState(false)


    console.log(`Fetching page ${page} with query: ${searchStr}`);

    const handleInput = (e) => {
        setSearchStr(e.target.value)
        setShowSearch(false)

        if(e.target.value?.trim()) setShowSearch(true)
    }

    const handleSearch = (query) => {
        if (!query.trim()) return;

        setShowSearch(false)
        setHasMorePosts(true)
        setPage(1)
        setPosts([])

        fetchQueriedPosts(query, 1)
    }

    const fetchQueriedPosts = async (query, page) => {

        if(loading && !hasMorePosts) return
        setLoading(true)

        try {
            console.log(`Fetching page ${page} with query: ${query}`);

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/search?query=${query}&page=${page}`, {withCredentials: true})
            console.log(data.data)

            if(data?.data?.length > 0){
                setPosts(prev => [...prev, ...data?.data])
                setPage(prev => prev + 1)


            } else {
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

                if(hasMorePosts && searchStr?.trim()){
                    console.log(`Fetching page ${page} with query: ${searchStr}`);
                    console.log('send request')
                    fetchQueriedPosts(searchStr, page)
                }
            }

        }, 500)

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }

    }, [searchStr, page, hasMorePosts])


    const handleSearchClear = () => {
        setPosts([])
    }

    return(
        <div>
            <div className="flex items-center gap-2 md:block relative z-20 sticky top-0 bg-white border-b border-slate-200 p-2">
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
                <input
                    className="outline rounded-xl outline-slate-200 focus:outline-slate-500 w-full h-min py-2 px-3" placeholder="search post or users"
                    type="text"
                    value={searchStr}
                    onChange={(e) => handleInput(e)}
                />

                {showSearch && <div className="absolute top-13 left-8 md:top-11 bg-white w-[90%] mx-4 mt-2 border border-slate-300 shadow-md overflow-hidden rounded-xl">
                    <button type="submit" onClick={() => handleSearch(searchStr)} className="cursor-pointer text-lg p-2 w-full text-start hover:bg-slate-50">search <span className="font-bold text-blue-500">"{searchStr}"</span></button>
                </div>}
            </div>


            {posts.length > 0 ?
                <div>
                    <div className="px-2 py-2 flex justify-between border-b border-slate-200 items-center">
                        <p>Search result for <span className="font-bold">"{searchStr}"</span></p>
                        <button className="cursor-pointer px-3 py-1 rounded-xl font-bold hover:bg-blue-200" onClick={handleSearchClear}>clear</button>
                    </div>
                    {posts.map(post => <PostCard key={post?._id} post={post}/>)}
                </div> :
                <Reposted/>

                // <p className="h-screen text-center pt-12 font-semibold text-red-500">No posts found</p>
            }
        </div>
    )
}

export default Explore
