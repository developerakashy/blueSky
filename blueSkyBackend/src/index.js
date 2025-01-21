import app from "./app.js";
import { connectDB } from "./db/index.js";
const PORT = process.env.PORT

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`server is listening on PORT ${PORT}`)
    })

})
.catch((e) => {
    console.log('Error Connecting DB', e)
})
