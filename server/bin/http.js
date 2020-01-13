const http = require('http')
const app = require('../app')
const server = http.createServer(app)
const PORT = process.env.PORT || 3000
const io = require('socket.io')(server)

app.use((req, res, next) => {
  req.io = io
  next()
})

server.listen(PORT, () => console.log('listening to port', PORT))
