import React from "react"
import { useUser } from "../context/userContext"

function EditProfile({setEdit}){
    const {user} = useUser()

    return(
        <div className="fixed z-20 h-screen left-0 w-screen bg-black/50 flex justify-center items-center">
          <div className="z-10 w-[600px] h-min bg-white pb-8 rounded-xl">
                <div className="flex justify-between px-4 py-2 border-b-[1px]">
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setEdit(false)} className="px-2 border-2">close</button>
                        <p className="font-bold text-lg ml-2">Edit Profile</p>
                    </div>

                    <button className="bg-blue-500 text-white px-4 h-min py-1 rounded-full">Save</button>
                </div>
                <div className="relative">
                    <div className="h-52 w-full">
                        <img className="block h-52 w-full object-cover" src={user?.coverImage} alt="" />
                        <label htmlFor="coverImage">
                            
                        </label>
                    </div>
                    <img className="border-[6px] border-white mx-4 block h-32 w-32 absolute bottom-[-64px] rounded-full object-cover" src={user?.avatar} alt="" />
                </div>

                <div className="mt-20 px-4">
                    <div class="relative">
                        <input type="text" id="floating_filled" class="block rounded-lg px-2.5 pb-1.5 pt-5 w-full text-lg text-gray-900 border-2 border-gray-300 appearance-none text-white  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label for="floating_filled" class="absolute text-base text-gray-600 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Name</label>
                    </div>

                    <div class="relative mt-2">
                        <textarea type="text" id="floating_filled" class="block rounded-lg px-2.5 pb-1.5 pt-5 w-full text-lg text-gray-900 border-2 border-gray-300 appearance-none text-white  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " rows='3' ></textarea>
                        <label for="floating_filled" class="absolute text-base text-gray-600 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">About</label>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default EditProfile
