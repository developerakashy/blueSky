import dotenv from "dotenv";
dotenv.config();

const DB_NAME = 'blueSky'

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
}

console.log(options)
export { DB_NAME, options }
