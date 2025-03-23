import axios from "axios"
import { UserRound } from "lucide-react"
import { useRef } from "react"
import { useState } from "react"
import toast from "react-hot-toast"

function PostInput({setContent, content}){
    const [suggestion, setSuggestion] = useState([])
    const [showSuggestion, setShowSuggestion] = useState(false)
    const [caretPosition, setCaretPosition] = useState({x: 0, y: 0})
    const [loading, setLoading] = useState(false)
    const postEditorRef = useRef(null)


    const getUsers = async (searchStr) => {

        if(loading) return

        setLoading(true)
        try {

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/all?search=${searchStr}`, {withCredentials: true})
            console.log(data.data)
            setSuggestion(data.data)

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)

        } finally {
            setLoading(false)
        }
    }

    const getCaretPosition = () => {
        const selection = window.getSelection()

        if(!selection.rangeCount) return {x: 0, y: 0}

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        return {x: rect.left + window.scrollX, y: rect.top + window.scrollY + 25}
    }

    const handleInput = () => {
        const text = postEditorRef.current.innerText
        setContent(text)

        const mentionMatch = text.match(/(^|\s)@([\w.-]{1,15})$/)

        if(mentionMatch){
            setShowSuggestion(true)
            getUsers(mentionMatch[2])
            console.log(mentionMatch[2])

        } else {
            setCaretPosition(getCaretPosition())
            setShowSuggestion(false)
            console.log(caretPosition)
        }

        const textFormatted = text.replace(/(^|\s)@([\w.-]{1,15})/g, `$1<span class='text-blue-500' contenteditable="false">@$2</span>`)

        if(postEditorRef.current.innerHTML !== textFormatted){

            postEditorRef.current.innerHTML = textFormatted
            placeCursorAtEnd(postEditorRef.current)
        }

    }

    const replaceWithSuggestion = (username) => {
        let textFormatted = content.replace(/(^|\s)@([\w.-]{1,15})$/, `$1<span class='text-blue-500' contenteditable="false">@${username}</span>$1`)
        textFormatted = textFormatted.replace(/(^|\s)@([\w.-]{1,15})/g, `$1<span class='text-blue-500' contenteditable="false">@$2</span>`)

        postEditorRef.current.innerHTML = textFormatted
        setContent(postEditorRef.current.innerText)
        setShowSuggestion(false)
        placeCursorAtEnd(postEditorRef.current)


    }



    const placeCursorAtEnd = (element) => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    };




    return(
        <div className="">
            <div
                ref={postEditorRef}
                contentEditable
                className="max-h-64 min-h-32 overflow-y-auto p-2 text-lg whitespace-break-spaces outline-1 outline-slate-200 rounded-xl focus:outline-slate-400"
                onInput={handleInput}
                placeholder='Type your ideas here'
            >

            </div>

            {showSuggestion &&
                <div className="fixed z-30 border border-slate-200 rounded-xl w-fit min-h-8 max-h-72 overflow-y-auto bg-white"
                style={{left: caretPosition.x, top: caretPosition.y}}
                >
                    {suggestion.length > 0 && suggestion.map(user =>
                        <div key={user?._id} onClick={() => replaceWithSuggestion(user?.username)}  className="cursor-pointer flex gap-2 px-5 py-3 border-b border-slate-200 hover:bg-gray-100 min-w-64">
                            <div className="min-w-12 flex justify-center">
                            {!user?.avatar ?
                                <div className='h-10 w-10 bg-slate-100 flex justify-center items-center rounded-full object-cover'>
                                    <UserRound className='h-5 w-5 stroke-gray-600 rounded-full'/>
                                </div> :

                                <img className='h-12 w-12 rounded-full object-cover' src={user?.avatar} alt="" />
                            }
                            </div>

                            <div className="w-full">
                                <p className="text-[15px] font-semibold">{user?.fullname?.toUpperCase()}</p>
                                <p className="text-[15px] text-gray-600">@{user?.username}</p>
                            </div>
                        </div>
                    )}

                    {!suggestion.length &&
                        <div className="px-5 py-3 border-slate-200 min-w-64">
                            <p className="text-red-500">username not found</p>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default PostInput
