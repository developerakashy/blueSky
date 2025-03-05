import { createContext, useContext } from "react";

const FollowingPostContext = createContext()

export const FollowingPostContextProvider = FollowingPostContext.Provider

export function useFollowingPostContext(){
    return useContext(FollowingPostContext)
}
