import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useUser } from "../context/userContext";



function DirectMessage(){
    const {user} = useUser()

    useEffect(() => {
        if(!user) return

        const socket = io('http://localhost:8003', {
            transports: ['websocket'], // Ensure the correct transport method
            withCredentials: true, // Include credentials if using CORS
            query: { userId: user?._id }
        });

        socket.on('newNotification', (data) => {
            console.log(data)
        })

        socket.on('connect', () => {
          console.log('Connected to server:', socket.id);
        });

        socket.on('connect_error', (err) => {
          console.error('Connection error:', err.message);
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from server');
        });

        return () => {
            socket.disconnect()
        }

    }, [user])

    return(
        <div>

        </div>
    )
}

export default DirectMessage
