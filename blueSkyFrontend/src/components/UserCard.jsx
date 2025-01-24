import React from "react";

function UserCard({user}){


    return(
        <div className="flex gap-2 p-3 hover:bg-gray-100">
            <div className="min-w-12 flex justify-center">
                <img className='h-12 w-12 rounded-full object-cover' src={user?.avatar} alt="" />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[15px] font-semibold">{user?.fullname?.toUpperCase()}</p>
                        <p className="text-[15px] text-gray-600">@{user?.username}</p>
                    </div>
                    <button className="px-4 py-1 h-min bg-black text-white rounded-full">follow</button>
                </div>
                <p>{user?.about}</p>
            </div>
        </div>
    )
}

export default UserCard
