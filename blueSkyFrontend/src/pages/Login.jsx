import { useState } from 'react'
import { useUser } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import 'ldrs/mirage'
import 'ldrs/dotPulse'
import axios from "axios"
import { Eye, EyeOff, Sparkle } from 'lucide-react'

function Login(){
    const {setUser, setLoading} = useUser()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    const handleInputChange = (e) => {
        let { name, value } = e.target

        setFormData(prev => ({...prev, [name]: value}))
        value = value?.trim()
        const newErrors = {}

        if(name === 'username'){
            const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/

            if(!value){
                newErrors.username = '*Username is required'

            } else if(!usernameRegex.test(value)){
                newErrors.username = '*Only alphanumeric, 3-15 characters and 0 spaces'

            } else {
                newErrors.username = undefined
            }
        }

        if(name === 'password'){
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/

            if(!value){
                newErrors.password = '*Password is required'

            } else if(!passwordRegex.test(value)){
                newErrors.password = '*Atleast 8 characters, including one number and one special character'

            } else {
                newErrors.password = undefined
            }

        }

        if(Object.keys(newErrors).length > 0) setErrors(prev => ({...prev, ...newErrors}))
    }

    const handleLogin = (e) => {
        e.preventDefault()
        const {username, password} = formData
        const emptyErrors = {}

        if(username?.trim() === '') emptyErrors.username = '*Username is required'
        if(password?.trim() === '') emptyErrors.password = '*Password is required'

        if(Object.keys(emptyErrors).length > 0){
            setErrors(prev => ({...emptyErrors, ...prev}))
            toast.error('All fields are required')
            return
        }

        const isFormValid = Object.values(errors)?.some(val => val !== undefined)

        if(isFormValid){
            toast.error('Error in fields')
            return
        }

        loginUser()

    }

    const loginUser = async () => {
        setLoading(true)

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/login`, formData, {withCredentials: true})
            console.log(data.data)
            setUser(data.data)

            toast.success(`You logged in successfully`)
            navigate('/')


        } catch (error) {
            console.log(error)
            toast.error('username or password is incorrect')

        } finally {
            setLoading(false)
        }
    }

    return(
        <div className="flex justify-center bg-blue-50 min-h-screen">

            <form className="sm:shadow-md sm:rounded-2xl sm:my-12 sm:h-fit bg-white w-full  sm:max-w-[520px]">
                <div className='flex flex-col items-center w-full pt-16 sm:pt-6'>
                    <div className="h-18">
                    <Sparkle className="h-14 w-14 shadow-lg p-2 rounded-lg stroke-blue-400 fill-blue-400"/>
                    </div>

                    <p className="text-4xl mb-4">Sign In</p>
                    <p className='text text-slate-500 mb-4'>To continue to BlueSky</p>
                </div>

                <div className='w-full flex flex-col items-center px-6'>

                    <div className="w-full pb-6 pt-6 border-t-1 border-slate-200">
                        <label className="block text-slate-500 text-sm mb-1">Username*</label>
                        <input
                            name='username'
                            className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2  rounded-lg"
                            type="text"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={(e) => handleInputChange(e)}
                        />
                        {errors?.username && <p className='text-sm text-red-600 mt-1'>{errors?.username}</p>}
                    </div>

                    <div className="w-full pb-6">
                        <label className="block text-slate-500 text-sm mb-1">Password*</label>
                        <div className='flex items-center relative'>
                            <input
                                name='password'
                                className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2  rounded-lg"
                                type={showPassword ? `text` : `password`}
                                placeholder="Enter Password"
                                value={formData.password}
                                onChange={(e) => handleInputChange(e)}
                            />
                            {formData.password &&
                            <button type='button' className='cursor-pointer absolute right-2' onClick={() => setShowPassword(prev => !prev)}>
                                {showPassword ?
                                    <EyeOff className='h-6 w-6'/> :
                                    <Eye className='h-6 w-6'/>
                                }
                            </button>}
                        </div>
                        {errors?.password && <p className='text-sm text-red-600 mt-1'>{errors?.password}</p>}
                    </div>

                    <button onClick={(e) => handleLogin(e)} className="cursor-pointer bg-indigo-500 text-white py-2 w-full rounded-full">Sign in</button>

                    <div className="flex mt-4 mb-8 gap-1">
                        <p>Don't have an account?</p> <button type='button' onClick={() => navigate('/auth/registration')} className="cursor-pointer text-indigo-700">Sign up</button>
                    </div>
                </div>

            </form>

        </div>
    )


}

export default Login
