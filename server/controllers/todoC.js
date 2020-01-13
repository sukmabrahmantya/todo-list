const { Todo } = require('../models')

class TodoController {
  static createTodo(req, res, next) {
    Todo.create({
      creator: req.user._id,
      name: req.body.name,
      description: req.body.description,
      group: req.params.id,
      dueDate: req.body.dueDate
        ? new Date(req.body.dueDate).setHours(23, 59, 59)
        : undefined
    })
      // .then(todo => {
      //   return todo.populate('creator', 'username email -_id').populate('group', '') execPopulate()
      // })
      .then(todo => {
        if (todo.group) {
          req.io.of(`/${todo.group}`).emit('created-group-todo', todo)
        }
        res.status(201).json({
          message: 'Todo created',
          data: {
            _id: todo._id,
            name: todo.name,
            description: todo.description,
            group: todo.group,
            dueDate: todo.dueDate,
            createdAt: todo.createdAt,
            status: todo.status
          }
        })
      })
      .catch(next)
  }

  static getAllUserTodos(req, res, next) {
    const from = req.query.from
    Todo.find(
      from
        ? from == 'private'
          ? { $and: [{ creator: req.user._id }, { group: { $exists: false } }] }
          : { $and: [{ creator: req.user._id }, { group: from }] }
        : { creator: req.user._id }
    )
      .populate({ path: 'creator', select: 'username email -_id' })
      .then(todos => {
        res.status(200).json({
          data: todos.map(todo => {
            return {
              _id: todo._id,
              name: todo.name,
              creator: todo.creator,
              description: todo.description,
              dueDate: todo.dueDate,
              updatedAt: todo.updatedAt,
              status: todo.status
            }
          })
        })
      })
      .catch(next)
  }

  static getAllGroupTodos(req, res, next) {
    Todo.find({ group: req.params.id })
      .populate({ path: 'creator', select: 'username email -_id' })
      .then(todos => {
        res.status(200).json({
          data: todos.map(todo => {
            return {
              _id: todo._id,
              name: todo.name,
              creator: todo.creator,
              description: todo.description,
              dueDate: todo.dueDate,
              updatedAt: todo.updatedAt,
              status: todo.status
            }
          })
        })
      })
      .catch(next)
  }

  static getOneTodo(req, res, next) {
    Todo.findById(req.params.id)
      .populate({ path: 'creator', select: 'username email -_id' })
      .populate({ path: 'group', select: 'name -_id' })
      .then(todo => {
        res.status(200).json({
          data: {
            _id: todo._id,
            name: todo.name,
            creator: todo.creator,
            group: todo.group,
            description: todo.description,
            dueDate: todo.dueDate,
            updatedAt: todo.updatedAt,
            status: todo.status
          }
        })
      })
      .catch(next)
  }

  static editTodo(req, res, next) {
    Todo.findById(req.params.id)
      .then(todo => {
        todo.name = req.body.name || todo.name
        todo.description = req.body.description || todo.description
        todo.dueDate = req.body.dueDate
          ? new Date(req.body.dueDate).setHours(23, 59, 59)
          : todo.dueDate
        if (new Date(req.body.dueDate).setHours(23, 59, 59) < new Date()) {
          if (todo.status != 'done') todo.status = 'missed'
        } else if (todo.status == 'missed') todo.status = 'pending'

        return todo.save()
      })
      .then(todo => {
        return todo
          .populate({ path: 'creator', select: 'username email -_id' })
          .populate({ path: 'group', select: 'name -_id' })
      })
      .then(todo => {
        if (todo.group) {
          req.io.of(`/${todo.group}`).emit('updated-group-todo', todo)
        }
        res.status(200).json({
          message: 'Todo updated',
          data: {
            _id: todo._id,
            name: todo.name,
            creator: todo.creator,
            group: todo.group,
            description: todo.description,
            dueDate: todo.dueDate,
            updatedAt: todo.updatedAt,
            status: todo.status
          }
        })
      })
      .catch(next)
  }

  static updateStatus(req, res, next) {
    Todo.findById(req.params.id)
      .then(todo => {
        todo.status =
          new Date(todo.dueDate) < new Date()
            ? 'missed'
            : todo.status == 'pending'
            ? 'done'
            : todo.status == 'done'
            ? 'pending'
            : todo.status

        return todo.save()
      })
      .then(todo => {
        if (todo.group) {
          req.io.of(`/${todo.group}`).emit('updated-group-todo', todo)
        }
        res.status(200).json({
          message: `Todo status changed to ${todo.status}`,
          data: {
            _id: todo._id,
            name: todo.name,
            creator: todo.creator,
            group: todo.group,
            description: todo.description,
            dueDate: todo.dueDate,
            updatedAt: todo.updatedAt,
            status: todo.status
          }
        })
      })
      .catch(next)
  }

  static deleteTodo(req, res, next) {
    Todo.findByIdAndDelete(req.params.id)
      .then(todo => {
        if (todo.group) {
          req.io.of(`/${todo.group}`).emit('deleted-group-todo', todo)
        }
        res.status(200).json({
          message: 'Todo deleted'
        })
      })
      .catch(next)
  }
}

module.exports = TodoController
