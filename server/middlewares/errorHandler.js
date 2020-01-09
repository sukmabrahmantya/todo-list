'use strict'

module.exports = (err, req, res, next) => {
  let status, message
  switch (err.name) {
    case 'ValidationError':
      const mongooseErrors = err.errors
      const errors = []

      for(let key in mongooseErrors) {
        errors.push(mongooseErrors[key].message)
      }

      status = 400
      message = errors
      break
    case 'SyntaxError':
      status = 401
      message = err.message
      break
    case 'JsonWebTokenError':
      status = 401
      message = 'Invalid Access Token'
      break
    default:
      status = err.status || 500
      message = err.message || 'Internal Server Error'
      break;
  }

  res.status(status).json({ message })
}