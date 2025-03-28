import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import debounce from '../utils/debounce'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { dotPulse } from "ldrs";
import { Eye, EyeOff, Sparkle } from "lucide-react";
dotPulse.register()

function Registration(){
    const {setLoading} = useUser()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: ''
    })
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(false)
    const [emailExist, setEmailExist] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        setLoading(false)
    }, [])

    const handleInputChange = async (e) => {
        let {name, value} = e.target
        const newErrors = {}

        value = value?.trim()
        setFormData(prev => prev[name] !== value ? {...prev, [name]: value } : prev)


        if(name === 'firstName'){
            if(!value){
                newErrors.firstName = '*First name is required'

            } else if(value?.length < 3) {
                newErrors.firstName = '*please enter atleast 3 characters'

            } else {
                newErrors.firstName = undefined
            }
        }

        if(name === 'lastName'){
            if(!value){
                newErrors.lastName = '*Last name is required'

            } else {
                newErrors.lastName = undefined
            }
        }

        if(name === 'email'){
            setEmailExist(false)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if(!value){
                newErrors.email = '*Email address is required'

            } else if(!emailRegex.test(value)) {
                newErrors.email = '*Enter a valid email'

            } else {
                newErrors.email = undefined
            }

        }

        if(name === 'username'){
            const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/
            setIsUsernameAvailable(null)
            setCheckingUsername(false)

            if(!value){
                newErrors.username = '*Username is required'

            } else if(!usernameRegex.test(value)) {
                newErrors.username = '*Only alphanumeric, 3-15 characters and 0 spaces'

            } else {
                newErrors.username = undefined
                setCheckingUsername(true)

            }

        }

        if(name === 'password'){
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/

            if(!value){
                newErrors.password = '*Password is required'

            } else if(!passwordRegex.test(value)) {
                newErrors.password = '*Atleast 8 characters, including one number and one special character'

            } else {
                newErrors.password = undefined
            }
        }

        if(Object.keys(newErrors).length > 0) setErrors(prev => ({...prev, ...newErrors}))
    }

    const checkUserAvailability = async (username, email) => {
        username && setCheckingUsername(true)
        const reqBody = username ? {username} : {email}

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/exist`, reqBody)
            console.log(data.data)
            username ? setIsUsernameAvailable(data?.data?.available) : setEmailExist(data?.data?.exist)

        } catch (error) {
            console.log(error)

        } finally {
            setTimeout(() => {
                username && setCheckingUsername(false)
            }, 500)
        }

    }

    const debounceCheckUserWithUsername = useCallback(debounce(() => checkUserAvailability(formData.username, ''), 500), [formData.username])
    const debounceCheckUserWithEmail = useCallback(debounce(() => checkUserAvailability('', formData.email) ,1000), [formData.email])

    useEffect(() => {
        if(formData.username?.trim() && !errors?.username){
            debounceCheckUserWithUsername()
        }

        return () => {
            debounceCheckUserWithUsername.cancel()
        }

    }, [formData.username, debounceCheckUserWithUsername])

    useEffect(() => {
        if(formData.email?.trim() && !errors?.email){
            debounceCheckUserWithEmail()
        }

        return () => {
            debounceCheckUserWithEmail.cancel()
        }

    }, [formData.email, debounceCheckUserWithEmail])


    const handelUserRegistration = async (e) => {
        e.preventDefault()
        const emptyEntry = Object.values(formData)?.some(val => val === '')

        if(emptyEntry){
            let emptyErrors = {}
            let keys = Object.keys(formData)

            keys.map(key => formData[key] !== '' ? '' : emptyErrors[key] = `*${key.charAt(0).toUpperCase()}${key.slice(1)} is required`)

            if(Object.keys(emptyErrors).length > 0) setErrors(prev => ({...emptyErrors, ...prev}))

            toast.error('All fields are required')
            return

        }

        const isFormValid = Object.values(errors)?.some(val => val !== undefined)

        if(isFormValid){
            toast.error('errors in fields')
            return
        }

        if(emailExist){
            toast.error('Account exist with provided Email ID. Try to sign in')
            return
        }

        if(!isUsernameAvailable) {
            toast.error('username unavailable. Choose new username')
            return
        }

        createUser()

    }


    const createUser = async () => {
        setLoading(true)
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/register`, {
                fullname: `${formData?.firstName} ${formData?.lastName}`,
                email: formData?.email,
                username: formData?.username,
                password: formData?.password
            })

            console.log(data)
            toast.success('user created successfully')

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: ''
            })
            setIsUsernameAvailable(false)
            setShowPassword(false)
            setErrors({})
            navigate('/auth/login')

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setLoading(false)

        }
    }


    return (
        <div className="flex justify-center bg-blue-50 min-h-screen">

            <form className="sm:shadow-md sm:rounded-2xl sm:my-12 sm:h-fit bg-white w-full sm:max-w-[520px]">
                <div className='flex flex-col items-center w-full pt-6'>
                    <div className="h-18">
                        <Sparkle className="h-14 w-14 shadow-lg p-2 rounded-lg stroke-blue-400 fill-blue-400"/>
                    </div>

                    <p className="text-4xl mb-4">Sign Up</p>
                    <p className='text text-slate-500 mb-4'>To continue to BlueSky</p>
                </div>

                <div className='w-full flex flex-col items-center px-6'>
                    <div className="flex gap-4 max-w-full pt-6 pb-6 border-t-1 border-slate-200">
                        <div className="">
                            <label className="block text-slate-500 text-sm mb-1">First Name*</label>
                            <input
                                name='firstName'
                                className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2  rounded-lg"
                                type="text"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange(e)}
                            />
                            {errors?.firstName && <p className='text-sm text-red-600 mt-1'>{errors?.firstName}</p>}
                        </div>
                        <div className="">
                            <label className="block text-slate-500 text-sm mb-1">Last Name*</label>
                            <input
                                name='lastName'
                                className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2 rounded-lg"
                                type="text"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange(e)}
                            />
                            {errors?.lastName && <p className='text-sm text-red-600 mt-1'>{errors?.lastName}</p>}
                        </div>
                    </div>

                    <div className="w-full pb-6">
                        <label className="block text-slate-500 text-sm mb-1">Email ID*</label>
                        <input
                            name='email'
                            className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2 rounded-lg"
                            type="email"
                            placeholder="Enter Email ID"
                            value={formData.email}
                            onChange={(e) => handleInputChange(e)}

                        />
                        {errors?.email && <p className='text-sm text-red-600 mt-1'>{errors?.email}</p>}
                        {
                            emailExist && <p className='text-sm text-red-600 mt-1'>*Email ID already exist with an account. Try to sign in</p>
                        }
                    </div>

                    <div className="w-full pb-6">
                        <label className="block text-slate-500 text-sm mb-1">Username*</label>
                        <input
                            name='username'
                            className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2  rounded-lg"
                            type="text"
                            placeholder="Create Username"
                            value={formData.username}
                            onChange={(e) => handleInputChange(e)}
                        />
                        {errors?.username && <p className='text-sm text-red-600 mt-1'>{errors?.username}</p>}
                        {
                            checkingUsername &&
                            <div className='flex items-center gap-2'>
                                <p className='text-sm text-blue-600 mt-1 '>checking username</p>
                                <l-dot-pulse
                                    size='20'
                                    speed='1'
                                    color='blue'
                                ></l-dot-pulse>
                            </div>
                        }

                        {((isUsernameAvailable && !errors?.username) && !checkingUsername) && <p className='mt-1 text-sm text-green-500'>username available</p> }
                        {((isUsernameAvailable === false && !errors?.username) && (!checkingUsername && formData.username)) && <p className='mt-1 text-sm text-orange-500'>username unavailable</p>}
                    </div>

                    <div className="w-full pb-6">
                        <label className="block text-slate-500 text-sm mb-1">Password*</label>
                        <div className='flex items-center relative'>
                            <input
                                name='password'
                                className="outline-slate-300 outline-1 focus:outline-1 focus:outline-blue-400 w-full px-3 py-2  rounded-lg"
                                type={showPassword ? `text` : `password`}
                                placeholder="Create Password"
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

                    <button onClick={(e) => handelUserRegistration(e)} className="cursor-pointer bg-indigo-500 text-white py-2 w-full rounded-full">Sign up</button>

                    <div className="flex mt-8 mb-6 gap-1">
                        <p>Already have an account?</p> <button type='button' onClick={() => navigate('/auth/login')} className="cursor-pointer text-indigo-700">Sign in</button>
                    </div>
                </div>

            </form>
        </div>
    )
}

export default Registration
