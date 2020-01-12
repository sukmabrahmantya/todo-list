'use strict'

const { User } = require('../models')
const { generateToken } = require('../helpers/jwt')
const bcrypt = require('bcryptjs')

class userController {
  static register(req, res, next) {
    const { email, password, name } = req.body

    User
      .create({ email, password, name })
      .then(user => {
        const token = generateToken({ id: user._id })
        const data = {
          token, name: user.name
        }
        res.status(201).json(data)
      })
      .catch(next)
  }

  static login(req, res, next) {
    const { email, password } = req.body

    User
      .findOne({ email })
      .then(user => {
        if(user) {
          let valid = bcrypt.compareSync(password, user.password)
          if (valid) {
            let token = generateToken({ id: user.id })
            let data = {
              token, name: user.name
            }
            res.status(200).json(data)
          } else {
            throw ({
              status: 400,
              message: 'Your email/password is wrong'
            })
          }
        } else {
          throw({
            status: 400,
            message: 'Youre email is not register'
          })
        }
      })
      .catch(next)
  }
}

module.exports = userController