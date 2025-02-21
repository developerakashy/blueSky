import { UserRound } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

function UserCard({user}){
    const navigate = useNavigate()

    return(
        <div onClick={() => navigate(`/user/${user?.username}`)} className="cursor-pointer flex gap-2 p-3 hover:bg-gray-100">
            <div className="min-w-12 flex justify-center">
                {!user?.avatar ?
                    <div className='h-10 w-10 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                        <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                    </div> :

                    <img className='h-10 w-10 rounded-full object-cover' src={user?.avatar} alt="" />
                }
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[15px] font-semibold">{user?.fullname?.toUpperCase()}</p>
                        <p className="text-[15px] text-gray-600">@{user?.username}</p>
                    </div>
                    {/* <button className="px-4 py-1 h-min bg-black text-white rounded-full">follow</button> */}
                </div>
                <p>{user?.about}</p>
            </div>
        </div>
    )
}

export default UserCard
