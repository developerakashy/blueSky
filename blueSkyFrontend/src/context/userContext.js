import {createContext, useContext} from 'react'

const userContext = createContext({
    user: {},
    login: () => {},
    logout: () => {}
})

export const UserContextProvider = userContext.Provider

export function useUser(){
    return useContext(userContext)
}
