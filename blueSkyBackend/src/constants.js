import dotenv from "dotenv";
dotenv.config();

const DB_NAME = 'blueSky'

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
}

export { DB_NAME, options }
