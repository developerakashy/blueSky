import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import Registration from './pages/Registration'
import { UserContextProvider } from './context/userContext'
import Login from './pages/Login'
import axios from 'axios'
import Layout from './pages/Layout'
import Profile from './pages/Profile'
import Home from './pages/Home'
import PostView from './pages/PostView'
import { PostContextProvider } from './context/postContext'
import { ScrollProvider } from './context/ScrollContext'
import FollowingsAndFollowers from './pages/Following'
import Notification from './pages/Notification'
import Chats from './pages/Chats'
import ChatMessages from './pages/ChatMessages'
import VerifyUser from './pages/VerifyUser'
import Bookmark from './pages/Bookmark'
import { ToastContainer } from 'react-toastify'

function App() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [publishPost, setPublishPost] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])


  useEffect(() => {

    const getLoggedInUser = async () => {

      try {
        const { data } = await axios.get('http://localhost:8003/user/loggedin', {withCredentials: true})
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
            const { data } = await axios.get(`http://localhost:8003/user/notifications`, {withCredentials: true})
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
      const { data } = await axios.post('http://localhost:8003/user/logout',{}, {withCredentials: true})
      console.log(data)
      setUser('')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <UserContextProvider value={{user, chats, setChats, messages, setMessages, notifications, setNotifications, publishPost, setPublishPost, setUser, logout, loading, setLoading}}>
      <PostContextProvider value={{posts, setPosts}}>

      <BrowserRouter>
      {loading && <div className='z-50 fixed bg-blue-50/50  right-0 left-0 top-0 bottom-0 flex flex-col gap-2 justify-center items-center'>
          <l-mirage
              size="70"
              speed="1.5"
              color="blue"
          ></l-mirage>
          {/* <p className='text-white text-lg'>Do not refresh the page</p> */}
      </div>}
      <ToastContainer/>
      {/* <ScrollProvider> */}
        <Routes>
          <Route path="auth">
            <Route path='registration' element={<Registration/>} />
            <Route path='login' element={<Login/>} />
          </Route>
          <Route path='/' element={<Layout/>}>
            <Route index element={<Home/>} />
            <Route path='user'>
              <Route index path=':username' element={<Profile/>}/>
              <Route path=':username/followers' element={<FollowingsAndFollowers/>}/>
              <Route path=':username/followings' element={<FollowingsAndFollowers/>}/>
            </Route>
            <Route path='post/:postId' element={<PostView/>}/>
            <Route path='notifications' element={<Notification notifications={notifications}/>}/>
            <Route path='chat' element={<Chats/>}/>
            <Route path='chat/messages/:chatId' element={<ChatMessages/>}/>
            <Route path='bookmarks' element={<Bookmark/>}/>

          </Route>
          <Route path='/verify-token' element={<VerifyUser/>}/>

          <Route path='*' element={<p>Page not found</p>}/>
        </Routes>
      {/* </ScrollProvider> */}
      </BrowserRouter>

      </PostContextProvider>
    </UserContextProvider>
  )
}

export default App
