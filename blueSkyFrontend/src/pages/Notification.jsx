import React, { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard";
import { useUser } from "../context/userContext";
import { UserRound } from "lucide-react";

function Notification(){
    const { notifications, user } = useUser()

    return(
        <div className="w-full pb-186">
            <div className="border-b flex items-center gap-2 sticky top-0 bg-white/70 backdrop-blur-sm border-slate-200 p-2 md:p-4">
                {
                    user?.username &&
                    <div onClick={() => navigate(`/user/${user?.username}`)} className='md:hidden cursor-pointer p-2 max-w-12 w-12 rounded-full hover:bg-slate-200/50'>
                        {!user?.avatar ?
                            <div className='mr-2 h-8 w-8 bg-slate-200 flex justify-center items-center rounded-full object-cover'>
                                <UserRound className='h-4 w-4 stroke-gray-600 rounded-full'/>
                            </div> :

                            <img className='mr-2 block h-8 w-8 rounded-full object-cover' src={user?.avatar} alt="" />
                        }
                    </div>
                }
                <p className="font-bold text-xl">Notifications</p>
            </div>
            {notifications && notifications.map(notification => <NotificationCard key={notification?._id} notification={notification}/>)}
        </div>
    )
}

export default Notification
