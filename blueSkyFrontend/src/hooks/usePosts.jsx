import { useEffect, useState } from "react"
import { fetchPosts } from "../services/fetchPosts"
import { useUser } from "../context/userContext"


function usePosts(queryParams){
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    console.log('usePosts')
    useEffect(() => {

        const getPosts = async () => {
            setLoading(true)
            try {
                const response = await fetchPosts(queryParams)
                console.log(response)
                setPosts(response)

            } catch (error) {
                console.log(error)
                setError(error)
            } finally {
                setLoading(false)
            }

        }

        if(queryParams) getPosts()


    }, [queryParams])


    return {posts, loading, error}
}

export default usePosts
