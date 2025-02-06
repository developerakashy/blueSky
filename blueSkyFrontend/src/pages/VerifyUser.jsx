import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useUser } from '../context/userContext'

function VerifyUser(){
    const [success, setSuccess] = useState(false)
    const {user, setUser} = useUser()
    const [message, setMessage] = useState('Loading')
    const navigate = useNavigate()
    const location = useLocation()
    let token = location.search.split('=')[1]

    useEffect(() => {

        const verifyUser = async () => {
            try {
                const { data } = await axios.post(`http://localhost:8003/user/verify-token`, {token}, {withCredentials: true})
                setSuccess(true)
                setMessage('user verified successfully')
                return data
                setUser(data.data)

            } catch (error) {
                console.log(error)
                setMessage(data.data.message)
            }
        }

        if(user && !user?.isVerified){
            verifyUser()
        } else {
            setMessage('user is already verified')
        }
    }, [user])

    return(
        <div className='w-full h-screen flex flex-col justify-center items-center'>
            <div className='border-2 py-2 px-12'>
                <p className='text-lg'>{success ? message : 'verifying user...'}</p>
            </div>
            {success && <button className='bg-blue-500 text-white px-4 py-2 rounded-xl mt-2' onClick={() => navigate('/')}>Return to home page</button>}
        </div>
    )
}

export default VerifyUser
