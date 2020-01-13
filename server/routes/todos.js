const todos = require('express').Router()
const { TodoController } = require('../controllers')
const { authorizeTodo } = require('../middlewares/auth')

todos.post('/', TodoController.createTodo)

todos.use('/:id', authorizeTodo)
todos.get('/:id', TodoController.getOneTodo)
todos.put('/:id', TodoController.editTodo)
todos.patch('/:id/status', TodoController.updateStatus)
todos.delete('/:id', TodoController.deleteTodo)

module.exports = todos
