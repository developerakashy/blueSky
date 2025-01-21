import React, { useEffect, useState } from "react";
import axios from 'axios'
import { isUsernameValid } from "../../utils/validation";
import { useUser } from "../../context/userContext";

function StepTwo({updateFormData, nextStep, prevStep, formData}){
    const [username, setUsername] = useState(formData.username)
    const {user, setUser} = useUser()
    const [error, setError] = useState("")

    const handleNext = async (e) => {
        e.preventDefault()
        let errMsg = ""

        if(!errMsg?.trim()) errMsg = '⚠ Please provide username'

        if(!isUsernameValid(username)) errMsg = '⚠ Only alphanumeric, 3-15 characters and 0 spaces'

        if(!errMsg?.trim() || !isUsernameValid(username)){
            setError(errMsg)
            return
        }



        const options = {
            method: 'GET',
            url: `http://localhost:8001/api/v1/user/username/${username}`,
            headers: {accept: 'application/json'}
        };

        try {
            const { data }  = await axios(options);
            console.log(data);
            updateFormData({username})
            console.log('user creation successfull')
            setError("")
            nextStep()

        } catch (error) {
            console.log(error);
            console.log('user cannot be created')
            setError('username already taken. Try different')


        }
    }

    const btnDisabled = username?.trim()?.length < 3 ? true : false

    return(
        <div className="h-screen flex ">
            <div className="border-r-2 relative flex flex-col justify-center  w-2/6 text-end ">
                <img className="w-full absolute h-screen object-cover" src="https://images.pexels.com/photos/13038585/pexels-photo-13038585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"  alt="" />
                <p className="z-10 text-5xl pr-12 font-bold">Create Account</p>
                <p className="z-10 pr-12 text-lg font-bold">onboarding you</p>
            </div>


            <div className="z-10 from-sky-300 to-indigo-400 border-l-2 w-4/6 flex flex-col justify-center text-start pl-12" >
                <p className="text-sm font-medium mb-1">Step 2 of 3</p>
                <p className="text-2xl font-bold mb-4">Choose your username</p>
                <form className="w-3/5 " onSubmit={handleNext}>
                    {error?.trim() && <p className="border-2 text-sm rounded-lg border-red-500 bg-red-100 mb-4 px-4 py-2 ">{error}</p>}
                    <div className="mb-4">
                        <label className="block font-medium text-sm mb-1">username</label>
                        <input
                            className="border-2 rounded-lg outline-blue-400 px-4 py-2 w-full"
                            type="text"
                            placeholder="enter atleast 3 letter word"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between mt-8">
                        <button type="button" className="px-4 py-2 border-2 bg-stone-100 rounded-lg hover:bg-stone-200"  onClick={() => prevStep()}>Previous</button>
                        <button className={`px-5 py-2 bg-blue-500 rounded-lg text-white ${btnDisabled ? 'bg-indigo-300' : 'hover:bg-blue-600'}`} disabled={btnDisabled} type="submit">Next</button>
                    </div>

                </form>
            </div>
        </div>

    )
}

export default StepTwo
