import axios from "axios"
import { useUser } from "../context/userContext"
import { toast } from "react-toastify"
import { useState } from "react"
import { CircleX, Mail, MailOpen } from 'lucide-react'

function Verification({setPublishPost}){
    const {user, setLoading} = useUser()
    const [invalidCodeError, setInvalidCodeError] = useState(null)
    const [verificationCode, setVerificationCode] = useState(null)

    const sendVerificationCode = async () => {
        setLoading(true)

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/send-verification-email`,{}, {withCredentials: true})
            console.log(data.data)
            user.verificationCodeExpiry = data?.data?.codeExpiration
            toast.success('verification code sent successfully')

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setTimeout(() => setLoading(false), 500)
        }
    }

    const handleCodeVerification = async () => {


        if(!verificationCode?.trim()){
            setInvalidCodeError('*verification code required')
            toast.error('Verification code is required')
        }

        else if(verificationCode?.trim()?.length < 6){
            setInvalidCodeError('*6-digit verification code required')
            toast.error('6-digit verification code required')
        }

        else if(parseInt(verificationCode) != verificationCode ){
            setInvalidCodeError('*invalid verification code')
            toast.error('invalid verification code')
        }

        else{
            verifyUser()
        }
    }

    const verifyUser = async () => {
        setLoading(true)

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/verify-code`, {verificationCode}, {withCredentials: true})

            user.isVerified = data?.data?.isVerified
            setTimeout(() => {
                toast.success('user verified successfully')
            }, 500)

        } catch (error) {
            setTimeout(() => {
                toast.error(error?.response?.data?.message)
                setInvalidCodeError(`*${error?.response?.data?.message}`)
            }, 500)

        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 600)
        }
    }

    return (
        <>
            {(!user?.verificationCodeExpiry || user?.verificationCodeExpiry < Date.now()) &&
                <div className="bg-white relative rounded-xl h-fit max-h-96 px-4 mx-6 mt-12 w-full max-w-[620px] flex flex-col items-center">
                    <CircleX onClick={() => setPublishPost({publish: false})} color="gray" strokeWidth={1}  className="cursor-pointer absolute left-2 top-2 hover:stroke-white hover:fill-red-500 transition-colors"/>
                    <Mail color="white" fill="oklch(0.511 0.262 276.966)" strokeWidth="1" className="mt-6 h-14 w-14 p-2 bg-indigo-0 shadow-lg rounded-xl"/>

                    <p className="mt-4 text-3xl font-medium">Verify Email</p>
                    <p className="mt-4 text-gray-600 text-center">We will send an email with a 6-digit verification code to <strong className="text-black">{user?.email}</strong></p>
                    <button onClick={sendVerificationCode} className="cursor-pointer my-6 px-4 py-2 bg-indigo-600 text-white rounded-xl">Send</button>
                </div>
            }

            {user?.verificationCodeExpiry > Date.now() &&
                <div className="bg-white relative rounded-xl h-fit max-h-96 px-4 mx-6 mt-12 w-full max-w-[620px] flex flex-col items-center">
                    <CircleX onClick={() => setPublishPost({publish: false})} color="gray" strokeWidth={1}  className="cursor-pointer absolute left-2 top-2 hover:stroke-white hover:fill-red-500 transition-colors"/>

                    <MailOpen color="white" fill="oklch(0.511 0.262 276.966)" strokeWidth="1" className="mt-6 h-14 w-14 p-2 bg-indigo-0 shadow-lg rounded-xl"/>
                    <p className="mt-4 text-3xl font-medium">Email Verification</p>
                    <p className="mt-3 text-gray-600 text-center text-sm sm:w-[55%]">Please enter the 6-digit verification code that was sent to your email</p>
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            maxLength={6}
                            onChange={(e) => {
                                setVerificationCode(e.target.value)
                                setInvalidCodeError(null)
                            }}
                            className="mt-4 px-4 rounded-xl text-center w-36 py-2 text-2xl outline-1 outline-slate-300"
                        />
                        {invalidCodeError && <p className="text-sm text-red-600 mt-1">{invalidCodeError}</p>}
                    </div>
                    <button onClick={handleCodeVerification} className="cursor-pointer my-4 w-full py-2 rounded-full text-white sm:max-w-1/2 bg-indigo-500">Verify user</button>
                    <div className="flex gap-1 text-sm my-4">
                        <p>Didn't receive an email?</p>
                        <button onClick={sendVerificationCode} className="cursor-pointer text-blue-600">Resend code</button>
                    </div>
                </div>
            }
        </>
    )
}

export default Verification
