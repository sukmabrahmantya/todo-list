const { Schema, model } = require('mongoose')

const todoSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator id required']
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group'
    },
    name: {
      type: String,
      required: [true, 'Todo name required']
    },
    description: {
      type: String
    },
    status: {
      type: String,
      required: true,
      enum: ['done', 'pending', 'missed'],
      default() {
        return new Date(this.dueDate) >= new Date() ? 'pending' : 'missed'
      }
    },
    dueDate: {
      type: Date,
      required: true,
      default: new Date().setHours(23, 59, 59)
    }
  },
  {
    timestamps: true
  }
)

const Todo = model('Todo', todoSchema)

module.exports = Todo
