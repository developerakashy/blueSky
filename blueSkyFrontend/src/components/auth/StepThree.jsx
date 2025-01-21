import React, { useRef, useState } from "react";

function StepThree({formData, updateFormData}){
    const [avatarImage, setAvatarImage] = useState("")
    const [coverImage, setCoverImage] = useState("")
    const [description, setDescription] = useState("")

    const showImage = (e) => {
        e.preventDefault()
        const file = e.target.files[0]

        if(file){
            const reader = new FileReader()

            reader.addEventListener('load', (event) => {
                if(e.target.name === 'avatarImage'){
                    setAvatarImage(event.target.result)
                }

                if(e.target.name === 'coverImage'){
                    setCoverImage(event.target.result)
                }

            })

            reader.readAsDataURL(file)
        }

    }

    const handleProfileUpdate = (e) => {
        e.preventDefault()
        updateFormData({...formData, description})
    }


    return(
        <form onSubmit={(e) => handleProfileUpdate(e)} >
            <h2>Update your profile</h2>
            <p>{formData.username}</p>
            <p>----------------------</p>
            <label>Avatar</label>
            <input name="avatarImage" onChange={(e) => showImage(e)} type="file" accept="image/*"/>
            <img  className="h-40 w-40 border-black bg-black border-2 rounded-full" src={avatarImage} alt="" />
            <p>----------------------</p>
            <label>CoverImage</label>
            <input name="coverImage" onChange={(e) => showImage(e)} type="file" accept="image/*"/>
            <img  className="min-h-56 w-96 border-black bg-black border-2" src={coverImage} alt="" />
            <p>----------------------</p>
            <label>Description</label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="About you"
            />
            <p>----------------------</p>
            <button>Skip</button>
            <button type="submit">update</button>
        </form>
    )
}

export default StepThree
