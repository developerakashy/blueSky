import axios from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import debounce from "../utils/debounce"
import { useUser } from "../context/userContext"
import { UserRound, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

function Search(){
    const navigate = useNavigate()
    const {user} = useUser()
    const [users, setUsers] = useState([])
    const [searchStr, setSearchStr] = useState('')


    const fetchUsers = async (searchStr) => {

        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/all?search=${searchStr}`)
            console.log(data?.data)
            setUsers(data?.data)

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {

        }
    }

    const debounceGetUser = useCallback(debounce(() => fetchUsers(searchStr), 500), [searchStr])

    useEffect(() => {
        if(searchStr?.trim()){
            debounceGetUser()
        }

        if(!searchStr?.trim()){
            setUsers([])
        }

        return () => {
            debounceGetUser.cancel()
        }

    }, [searchStr, debounceGetUser])

    return(
        <div className="max-w-[310px] mt-6">
            <div className="w-full px-4">
                <input
                    className="outline-slate-200 outline-1 focus:outline-slate-500 text-lg px-3 py-2 rounded-xl w-full"
                    type="text"
                    value={searchStr}
                    placeholder="search"
                    onChange={(e) => setSearchStr(e.target.value)}
                />
            </div>

            {users.length > 0 &&
                    <div className="border border-slate-200 h-12 w-72 absolute left-4 mt-4 bg-white max-h-96 h-fit rounded-xl overflow-y-auto">
                        <div className="w-full p-2">
                        <X onClick={() => setUsers([])} className="cursor-pointer rounded-full stroke-slate-700 bg-black stroke-white hover:bg-red-500 h-6 w-6 p-1"/>
                        </div>
                        {users.map(chatUser => chatUser?._id !== user?._id &&
                            <div key={chatUser?._id} onClick={() => navigate(`/user/${chatUser?.username}`)} className="cursor-pointer hover:bg-gray-50 flex gap-2 px-4 py-2 border-b border-slate-200">
                                {!chatUser?.avatar ?
                                    <div className='h-12 w-12 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                                        <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                                    </div> :

                                    <img className="h-12 w-12 rounded-full object-cover" src={chatUser?.avatar} alt="" />
                                }
                                <div>
                                    <p>{chatUser?.fullname?.toUpperCase()}</p>
                                    <p className="text-blue-500 font-semibold">@{chatUser?.username}</p>
                                </div>
                            </div>

                        )}

                    </div>
                }
        </div>
    )
}

export default Search
