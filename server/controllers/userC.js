const { User } = require('../models')
const { compare } = require('../helpers/passwordHandler')
const { encode } = require('../helpers/tokenHandler')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

class UserController {
  static signUp(req, res, next) {
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
      .then(user => {
        res.status(201).json({
          message: 'User registered',
          data: {
            username: user.username,
            email: user.email,
            password: req.body.password
          }
        })
      })
      .catch(next)
  }

  static signIn(req, res, next) {
    User.findOne({
      $or: [
        { username: req.body.username || req.body.emailUsername },
        { email: req.body.email || req.body.emailUsername }
      ]
    })
      .then(user => {
        try {
          if (!user) throw 'error'
          if (compare(req.body.password, user.password)) {
            const access_token = encode(user)
            res.status(200).json({
              message: 'Sign in success',
              data: { access_token }
            })
          } else throw 'error'
        } catch (err) {
          throw {
            status: 422,
            message: 'Username, email, or password wrong'
          }
        }
      })
      .catch(next)
  }

  static gSignIn(req, res, next) {
    client
      .verifyIdToken({
        idToken: req.body.g_token,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      .then(ticket => {
        const payload = ticket.getPayload()
        return User.findOne({ email: payload.email }).then(user => {
          if (user) {
            const access_token = encode(user)
            res.status(200).json({
              message: 'Sign in success',
              data: { access_token }
            })
          } else {
            return User.create({
              username:
                payload.name.toLowerCase().replace(/ +/g, '_') +
                Math.random() * 1000000,
              email: payload.email,
              password:
                payload.name.toLowerCase().replace(' ', '_') +
                Math.random() * 1000000
            }).then(user => {
              const access_token = encode(user)
              res.status(201).json({
                message: 'Sign in success',
                data: { access_token }
              })
            })
          }
        })
      })
      .catch(next)
  }

  static checkSession(req, res, next) {
    res.status(200).json({
      message: 'Token valid',
      data: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    })
  }

  static getAllUser(req, res, next) {
    User.find()
      .then(users => {
        res.status(200).json({
          data: users.map(user => {
            return {
              username: user.username,
              email: user.email
            }
          })
        })
      })
      .catch(next)
  }
}

module.exports = UserController
