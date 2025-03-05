import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "../components/Post";
import { toast } from "react-toastify";
import { ring2 } from 'ldrs'

function PostView(){
    const { postId } = useParams()
    const [post, setPost] = useState(null)
    const [postReplies, setPostReplies] = useState([])
    const [parentPost, setParentPost] = useState([])
    const [loading, setLoading] = useState(false)
    console.log(postReplies)

    useEffect(() => {
        const fetchPostInteraction = async () => {
            setLoading(true)

            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/${postId}`, {withCredentials: true})
                console.log(data)
                setPost(data.data.post)
                setPostReplies(data.data.replies)
                setParentPost(data.data.parentPost)

            } catch (error) {
                console.log(error)
                toast.error(error?.response?.data?.message)

            } finally {
                setTimeout(() => setLoading(false), 500)
            }
        }

        fetchPostInteraction()
    }, [postId])

    return(
        <div className="w-full">
            {loading &&
                <div className="w-full flex justify-center pt-6">
                    <l-ring-2
                      size="32"
                      stroke="4"
                      stroke-length="0.25"
                      bg-opacity="0.1"
                      speed="0.8"
                      color="blue"
                    ></l-ring-2>
                </div>
            }
            {post && !loading && <Post post={post} postReplies={postReplies} parentPost={parentPost}/>}
        </div>
    )
}

export default PostView
