if (process.env.NODE_ENV === 'development') require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3000

require('./config/mongoose')

const morgan = require('morgan')
const cors = require('cors')

app.use((req, res, next) => {
  req.io = io
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

app.use('/', require('./routes'))
app.use('/', (req, res, next) =>
  next({ status: 404, message: 'Invalid endpoint/not found' })
)
app.use(require('./middlewares/errorHandler'))

// module.exports = app

server.listen(PORT, () => console.log('listening to port', PORT))
