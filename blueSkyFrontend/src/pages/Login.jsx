import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../context/userContext'
import { useNavigate } from 'react-router'

function Login(){
    const {user, setUser, login} = useUser()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        if(user?.username){
            navigate('/')
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const user = await login(username,email, password)
        setUser(user.data)
    }


    return(
        <form onSubmit={(e) => handleSubmit(e)}>
            <p>Login Page</p>

            <div>
                <label>username</label>
                <input
                    type="text"
                    placeholder='enter your username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div>
                <label>email</label>
                <input
                    type="text"
                    placeholder='enter your eamil'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label>password</label>
                <input
                    type="text"
                    placeholder='enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>


            <button type='submit'>Login</button>
        </form>
    )
}

export default Login
