import { useNavigate } from "react-router"

function PostText({text}){
    const navigate = useNavigate()

    const handleUsernameClick = (e, username) => {
        e.stopPropagation()
        navigate(`/user/${username}`)
    }

    const renderText = (text) => {
        return text?.split(/(@[\w.-]{1,15})/g).map((part, index) => {
           
            if(part.startsWith('@')){
                const username = part.slice(1)

                return(
                    <span
                        key={index + Date.now()}
                        className="cursor-pointer text-blue-500"
                        onClick={(e) => handleUsernameClick(e, username)}
                    >
                        {part}
                    </span>
                )
            }

            return part
        })
    }

    return(
        <p className="text-gray-800">
            {renderText(text)}
        </p>
    )
}

export default PostText
