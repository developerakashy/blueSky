import React, { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard";
import axios from "axios";
import { useLocation } from "react-router";

function Notification({notifications}){
    const location = useLocation()

    useEffect(() => {
        console.log(location.pathname)
    }, [notifications])

    return(
        <div className="w-full pb-186">
            <div className="border-b-[1px] p-4">
                <p className="font-bold text-xl">Notifications</p>
            </div>
            {notifications && notifications.map(notification => <NotificationCard key={notification?._id} notification={notification}/>)}
        </div>
    )
}

export default Notification
