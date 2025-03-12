import React, { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard";
import { useUser } from "../context/userContext";

function Notification(){
    const { notifications } = useUser()

    return(
        <div className="w-full pb-186">
            <div className="border-b sticky top-0 bg-white/70 backdrop-blur-sm border-slate-200 p-4">
                <p className="font-bold text-xl">Notifications</p>
            </div>
            {notifications && notifications.map(notification => <NotificationCard key={notification?._id} notification={notification}/>)}
        </div>
    )
}

export default Notification
