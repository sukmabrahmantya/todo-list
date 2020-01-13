const user = require('express').Router()
const {
  UserController,
  TodoController,
  GroupController
} = require('../controllers')

user.get('/', UserController.getAllUser)
user.get('/todos', TodoController.getAllUserTodos)
user.get('/groups', GroupController.getAllUserGroups)

module.exports = user
