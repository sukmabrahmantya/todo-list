'use strict'

const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty"]
  },
  email: {
    type: String,
    required: [true, 'Email cannot be empty'],
    unique: [true, 'Email already taken']
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty'],
    minlength: [8, 'Password must be 8 - 12 character'],
    maxlength: [12, 'Passweod must be 8 - 12 characters']
  }
})

userSchema.pre('save', function(next) {
  const salt = bcrypt.genSaltSync(10)
  this.password = bcrypt.hashSync(this.password, salt)
  next()
})

const User = model('User', userSchema)

module.exports = User