import React, { useState } from "react";
import NotificationCard from "../components/NotificationCard";

function Notification(){
    const [notifications, setNotifications] = useState()

    return(
        <div className="w-[600px] border-x-[1px]">
            <NotificationCard/>
        </div>
    )
}

export default Notification
