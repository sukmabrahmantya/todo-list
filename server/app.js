'use strict'

if(process.env.NODE_ENV === 'development') require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001
const cors = require('cors')
const mongoose = require('mongoose')
const errorHandler = require('./middlewares/errorHandler')

mongoose.connect(process.env.MONGO_LOCAL, {
  useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true
}, function(err) {
  if(err) console.log(`Databas is an error`)
  else console.log(`Database in an active`)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`)
})