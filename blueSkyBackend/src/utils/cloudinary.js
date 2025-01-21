import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: 'donntefzc',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(error)
        return null
    }
}


const destroyOnCloudinary = async (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id)

        return response
    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary, destroyOnCloudinary }
