import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import replyRouter from './routes/reply.routes.js'
import likeRouter from './routes/like.routes.js'
import followRouter from './routes/follow.routes.js'
import chatRouter from './routes/chat.routes.js'
import bookmarkRouter from './routes/bookmark.routes.js'
import repostRouter from './routes/repost.routes.js'
import { ApiError } from './utils/ApiError.js'

const app = express()
const server = createServer(app)
export const io = new Server(server)

app.use(cors({
    origin: process.env.CORS_URL,
    credentials: true
}))

io.on('connection', (socket) => {
    console.log('user connected')

    const userId = socket.handshake.query.userId

    if(userId){
        socket.join(userId)
        console.log(`user joined their notification room: ${userId}`)

    }


    socket.on('disconnect', () => {
        console.log('disconnected')
    })
})






//common middlewares
app.use(express.json({limit: '32kb'}))
app.use(express.urlencoded({extended: true, limit: '32kb'}))
app.use(cookieParser())



app.use('/user', userRouter)
app.use('/post', postRouter)
app.use('/reply', replyRouter)
app.use('/like', likeRouter)
app.use('/follow', followRouter)
app.use('/chat', chatRouter)
app.use('/bookmark', bookmarkRouter)
app.use('/repost', repostRouter)

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            statusCode: err.statusCode,
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});

export default server
