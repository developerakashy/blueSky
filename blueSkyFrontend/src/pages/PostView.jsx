import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Post from "../components/Post";

function PostView(){
    const { postId } = useParams()
    const [post, setPost] = useState(null)
    const [postReplies, setPostReplies] = useState([])
    const [parentPost, setParentPost] = useState([])
    console.log(postReplies)

    useEffect(() => {
        const fetchPostInteraction = async () => {
            try {
                const { data } = await axios.get(`http://localhost:8003/post/${postId}`, {withCredentials: true})
                console.log(data)
                setPost(data.data.post)
                setPostReplies(data.data.replies)
                setParentPost(data.data.parentPost)
            } catch (error) {
                console.log(error)
            }
        }

        fetchPostInteraction()
    }, [postId])

    return(
        <div className="w-full">
            {post && <Post post={post} postReplies={postReplies} parentPost={parentPost}/>}
        </div>
    )
}

export default PostView
