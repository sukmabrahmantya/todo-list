'use strict'

const { Schema, model } = require('mongoose')
const ObjectId = Schema.Types.ObjectId

const todoSchema = new Schema ({
  name: {
    type: String,
    required: [true, 'Title cannot be empty']
  },
  description: {
    type: String,
    required: [true, 'Description cannot be empty']
  },
  status: {
    type: Boolean
  },
  due: {
    type: Date,
    required: [true, 'Due date cannot be empty']
  },
  user: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
})

todoSchema.pre('save', function(next) {
  this.status = false
  next()
})

const Todo = model('Todo', todoSchema)

module.exports = Todo