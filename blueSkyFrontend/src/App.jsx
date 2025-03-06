import { useEffect, useState, useMemo } from 'react'
import { UserContextProvider } from './context/userContext'
import { PostContextProvider } from './context/postContext'
import { ToastContainer } from 'react-toastify'
import { RouterProvider } from 'react-router-dom'
import axios from 'axios'
import router from './router'
import { FollowingPostContextProvider } from './context/followingPost'
import { mirage } from 'ldrs'
mirage.register()

function App() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  const [posts, setPosts] = useState([])
  const [hasMorePosts, setHasMorePosts] = useState(true)

  const [followingPosts, setFollowingPosts] = useState([])
  const [hasMoreFollowingPosts, setHasMoreFollowingPosts] = useState(true)

  const [publishPost, setPublishPost] = useState(false)
  const [notifications, setNotifications] = useState([])

  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])


  useEffect(() => {

    const getLoggedInUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/loggedin`, {withCredentials: true})
        console.log(data?.data)
        setUser(data?.data)
      } catch (error) {
        console.log(error?.response?.data?.message)
      }
    }
    getLoggedInUser()

  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/notifications`, {withCredentials: true})
            setNotifications(data.data)
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    if(user){
        fetchNotifications()
    }

  }, [user])



  const logout = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/logout`,{}, {withCredentials: true})
      console.log(data)
      setUser('')

    } catch (error) {
      console.log(error)
    }
  }

  const userContextValue = useMemo(() => ({
    user, chats, setChats, messages, setMessages,
    notifications, setNotifications, publishPost,
    setPublishPost, setUser, logout, loading, setLoading
  }), [user, chats, messages, notifications, publishPost, loading]);


  return (
    <UserContextProvider value={userContextValue}>
      <PostContextProvider value={{posts, setPosts, hasMorePosts, setHasMorePosts}}>
      <FollowingPostContextProvider value={{followingPosts, setFollowingPosts, hasMoreFollowingPosts, setHasMoreFollowingPosts}}>

      {loading &&
        <div className='z-50 fixed bg-blue-50/50  right-0 left-0 top-0 bottom-0 flex flex-col gap-2 justify-center items-center'>
          <l-mirage
              size="70"
              speed="1.5"
              color="blue"
              ></l-mirage>
        </div>
      }

      <ToastContainer/>

      <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true, }}/>

      </FollowingPostContextProvider>
      </PostContextProvider>
    </UserContextProvider>
  )
}

export default App
