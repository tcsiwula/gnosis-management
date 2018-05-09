import express from "express"
import path from "path"

const server = express()
const staticMiddleware = express.static("dist")

// TODO finish adding babel middleware to successfully compile and run


server.use(staticMiddleware)

server.listen(8080, () => {
  console.log("Server is running on port 8080")
})
