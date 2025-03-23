import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ring2 } from "ldrs"
import UserCard from "./UserCard"

function UserRecommend(){
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            if(loading) return

            setLoading(true)
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/follow/most-followed`)
                console.log(data)
                setUsers(data?.data)
            } catch (error) {
                console.log(error)
                toast.error(error?.response?.data?.message)

            } finally {
                setLoading(false)

            }
        }

        fetchUsers()

    }, [])

    return(
        <div className="max-w-[310px] mt-6 px-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <p className="px-4 py-2 font-semibold">Most Followed</p>
                {users?.length > 0 && !loading &&
                    <div className="">
                        {users.map(user => <UserCard key={user?._id} user={user} />)}
                    </div>
                }

            {loading &&
                <div className="w-full flex justify-center py-4">
                    <l-ring-2
                      size="32"
                      stroke="4"
                      stroke-length="0.25"
                      bg-opacity="0.1"
                      speed="0.8"
                      color="blue"
                      ></l-ring-2>

                </div>
            }
            </div>
        </div>
    )
}

export default UserRecommend
