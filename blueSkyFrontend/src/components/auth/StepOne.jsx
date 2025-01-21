import React, { useEffect, useState } from "react";
import { isDobValid, isEmailValid, isNameValid, isPasswordValid } from "../../utils/validation";
import { useNavigate } from "react-router";

function StepOne({updateFormData, nextStep, formData}){
    const [fullname, setFullname] = useState(formData.fullname)
    const [email, setEmail] = useState(formData.email)
    const [password, setPassword] = useState(formData.password)
    const [dob, setDob] = useState(formData.dob)
    const [error, setError] = useState("")
    const [isPasswordHidden, setPasswordHidden] = useState(true)
    const navigate = useNavigate()



    const handleNext = (e) => {
        e.preventDefault()
        let errMsg = ""

        if(!isDobValid(dob)) errMsg = "⚠ Age must be 13+"
        if(!dob?.trim()) errMsg = "⚠ Please enter your date of birth"

        if(!isPasswordValid(password)) errMsg = "⚠ Atleast 8 characters, including one number and one special character"
        if(!password?.trim()) errMsg = "⚠ Please choose password"

        if(!isEmailValid(email)) errMsg = "⚠ Your email appears to be invalid"
        if(!email?.trim()) errMsg = "⚠ Please enter your email"

        if(!isNameValid(fullname)) errMsg = "⚠ Only alphabets and spaces allowed"
        if(!fullname?.trim()) errMsg = "⚠ Please enter your name"

        if(errMsg){
            setError(errMsg)
            return
        }

        setError(errMsg)

        updateFormData({fullname, email, password, dob})
        nextStep()
    }

    return(
        <div className="h-screen flex ">
            <div className="border-r-2 relative flex flex-col justify-center  w-2/6 text-end ">
                <img className="w-full absolute h-screen object-cover" src="https://images.pexels.com/photos/13038585/pexels-photo-13038585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"  alt="" />
                <p className="z-10 text-5xl pr-12 font-bold">Create Account</p>
                <p className="z-10 pr-12 text-lg font-bold">onboarding you</p>
            </div>

            <div className="z-10 from-sky-300 to-indigo-400 border-l-2 w-4/6 flex flex-col justify-center text-start pl-12">
                <p className="text-sm font-medium mb-1">Step 1 of 3</p>
                <p className="text-2xl font-bold mb-4">Your account</p>
                <form className="w-3/5 " onSubmit={handleNext}>
                    {error && <p className="border-2 text-sm rounded-lg border-red-500 bg-red-100 mb-4 px-4 py-2 ">{error}</p>}
                    <div className="mb-4">
                        <label className="block font-medium text-sm mb-1">Name</label>
                        <input
                            className="border-2 rounded-lg outline-blue-400 px-4 py-2 w-full"
                            type="text"
                            placeholder="Enter your name"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                        />

                    </div>
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Email</label>
                        <input
                                className="border-2 rounded-lg outline-blue-400 px-4 py-2 w-full"
                                type="text"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                        />

                    </div>
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Password</label>
                        <input
                                className="border-2 rounded-lg outline-blue-400 px-4 py-2 w-full"
                                type={isPasswordHidden ? 'password' : 'text'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="mt-1 flex items-center justify-end">
                            <input
                                className="ml-4 w-4 h-4"
                                checked={!isPasswordHidden}
                                type="checkbox"
                                onChange={() => setPasswordHidden((prev) => !prev)}
                            />
                            <label className="ml-2 text-md text-gray-700">Show pasword</label>
                        </div>

                    </div>
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Date of birth</label>
                        <input
                                className="border-2 rounded-lg outline-blue-400 px-4 py-2 w-full"
                                type="date"
                                placeholder="Date of birth"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between mt-8">
                        <button onClick={() => navigate('/')} type="button" className="px-4 py-2 border-2 bg-stone-100 rounded-lg hover:bg-stone-200">Back</button>
                        <button className="px-5 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600" type="submit">Next</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StepOne
