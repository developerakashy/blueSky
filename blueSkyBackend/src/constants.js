const DB_NAME = 'blueSky'

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
}

export { DB_NAME, options }
