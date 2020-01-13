const { Schema, model, models } = require('mongoose')

const groupSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Group name required']
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

const Group = model('Group', groupSchema)

module.exports = Group
