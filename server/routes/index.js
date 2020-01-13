const routes = require('express').Router()
const { UserController } = require('../controllers')
const { authenticate } = require('../middlewares/auth')

routes.post('/signup', UserController.signUp)
routes.post('/signin', UserController.signIn)
routes.post('/g-signin', UserController.gSignIn)
routes.use(authenticate)
routes.get('/checksession', UserController.checkSession)
routes.use('/user', require('./user'))
routes.use('/todos', require('./todos'))
routes.use('/groups', require('./groups'))

module.exports = routes
