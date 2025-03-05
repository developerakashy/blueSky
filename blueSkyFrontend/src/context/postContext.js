import { createContext, useContext } from "react";

const PostContext = createContext()

export const PostContextProvider = PostContext.Provider

export function usePostContext(){
    return useContext(PostContext)
}
