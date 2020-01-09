'use strict'

const { User } = require('../models')
const { generateToken } = require('../helpers/jwt')

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
}

module.exports = userController