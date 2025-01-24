import server from "./app.js";
import { connectDB } from "./db/index.js";
const PORT = process.env.PORT

connectDB()
.then(() => {
    server.listen(PORT, () => {
        console.log(`server is listening on PORT ${PORT}`)
    })

})
.catch((e) => {
    console.log('Error Connecting DB', e)
})
