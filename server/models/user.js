const { Schema, model, models } = require('mongoose')
const { hash } = require('../helpers/passwordHandler')

const userShcema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username required'],
      validate: [
        {
          validator(val) {
            return models.User.findOne({ username: val }).then(user => {
              if (user) return false
              return true
            })
          },
          msg: 'Username already taken'
        },
        {
          validator(val) {
            return /^[a-zA-Z0-9_.]+$/.test(val)
          },
          msg:
            'Username can only have alphabets, numbers, underscores, and dots'
        }
      ]
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      validate: [
        {
          validator(val) {
            return models.User.findOne({ email: val }).then(user => {
              if (user) return false
              return true
            })
          },
          msg: 'Email already registered'
        },
        {
          validator(val) {
            return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
              val
            )
          },
          msg: 'Invalid email format'
        }
      ]
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      minlength: [6, 'Password must have at least 6 characters']
    }
  },
  {
    versionKey: false
  }
)

userShcema.post('validate', function(user, next) {
  user.password = hash(user.password)
  next()
})

const User = model('User', userShcema)

module.exports = User
