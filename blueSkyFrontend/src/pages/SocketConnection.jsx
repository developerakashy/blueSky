import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useUser } from "../context/userContext";

function SocketConnection({ setNotifications }) {
    const { user, messages, setChats, setMessages } = useUser();

    useEffect(() => {
        if (!user) return;

        const socket = io("http://localhost:8003", {
            transports: ["websocket"],
            withCredentials: true,
            query: { userId: user?._id },
        });

        socket.on("newNotification", (data) => {
            setNotifications((prev) => [data, ...prev]);
        });

        socket.on("newChatMessage", (data) => {
            setChats((prev) =>
                prev.map((chat) =>
                    chat?._id === data.chat?._id ? data.chat : chat
                )
            );

            if (messages?.[0]?.chatId === data?.chat?._id) {
                setMessages((prev) => [...prev, data?.message]);
            } else {
                console.log("Message does not belong to the active chat");
            }
        });

        socket.on("connect", () => {
            console.log("Connected to server:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.disconnect();
        };
    }, [user, messages]);

    return null;
}

export default SocketConnection;
