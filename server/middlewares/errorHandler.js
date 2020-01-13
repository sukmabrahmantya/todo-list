module.exports = (err, req, res, next) => {
  console.log(err.name || err.message)
  console.log(err.message)
  let status, message

  switch (err.name) {
    case 'ValidationError':
      status = 422
      message = []
      for (const path in err.errors) {
        message.push(err.errors[path].message)
      }
      break
    case 'CastError':
      status = 422
      message = 'Invalid object id'
      break

    default:
      status = err.status || 500
      message = err.message || 'Internal server error'
      break
  }

  res.status(status).json(message)
}
