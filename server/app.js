'use strict'

if(process.env.NODE_ENV === 'development') require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001
const cors = require('cors')
const mongoose = require('mongoose')
const router = require('./routes')
const errorHandler = require('./middlewares/errorHandler')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useFindAndModify: false, 
  useUnifiedTopology: true,
  useCreateIndex: true
}, function(err) {
  if(err) console.log(`Databas is an error`)
  else console.log(`Database in an active`)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', router)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`)
})