import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
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

function App() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [publishPost, setPublishPost] = useState(false)


  useEffect(() => {

    const getLoggedInUser = async () => {

      try {
        const { data } = await axios.get('http://localhost:8003/user/loggedin', {withCredentials: true})
        console.log(data.data)
        setUser(data.data)
      } catch (error) {
        console.log(error.response.data.message)
      }
    }
    getLoggedInUser()



  }, [])


  const login = async (username, email, password) => {
    const options = {
      method: 'post',
      url: 'http://localhost:8003/user/login',
      data: {
        username: username,
        email: email,
        password: password
      },
      withCredentials: true
    }

    try {
      const { data } = await axios(options)
      console.log(data)
      return data
    } catch (error) {
      console.log(error)
      return error.status === 200
    }
  }

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
    <UserContextProvider value={{user, publishPost, setPublishPost, setUser, login, logout}}>
      <PostContextProvider value={{posts, setPosts}}>

      <BrowserRouter>
      {/* <ScrollProvider> */}
        <Routes>
          <Route path="auth">
            <Route path='registration' element={<Registration/>} />
            <Route path='login' element={<Login/>} />
          </Route>
          <Route path='/' element={<Layout/>}>
            <Route index element={<Home/>} />
            <Route path='user' >
              <Route index path=':username' element={<Profile/>}/>
              <Route path=':username/followers' element={<FollowingsAndFollowers/>}/>
              <Route path=':username/followings' element={<FollowingsAndFollowers/>}/>
            </Route>
            <Route path='post/:postId' element={<PostView/>}/>
            <Route path='notifications' element={<Notification/>}/>
          </Route>

          <Route path='*' element={<p>Page not found</p>}/>
        </Routes>
      {/* </ScrollProvider> */}
      </BrowserRouter>

      </PostContextProvider>
    </UserContextProvider>
  )
}

export default App
