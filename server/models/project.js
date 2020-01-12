'use strict'

const { Schema, model } = require('mongoose')
const ObjectId = Schema.Types.ObjectId

const projectSchema = new Schema ({
  name: {
    type: String,
    required: [true, 'Name cannot be empty']
  },
  description: {
    type: String,
    required: [true, 'Description cannot be empty']
  },
  member: [{
    type: ObjectId,
    ref: 'User'
  }],
  todo: [{
    type: ObjectId,
    ref: 'Todo'
  }],
  admin: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
})

const Project = model('Project', projectSchema)

module.exports = Project