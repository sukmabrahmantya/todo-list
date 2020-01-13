const { User, Todo, Group } = require('../models')
const { decode } = require('../helpers/tokenHandler')

module.exports = {
  authenticate(req, res, next) {
    try {
      const payload = decode(req.headers.access_token)
      User.findById(payload.id)
        .then(user => {
          if (!user)
            throw { status: 401, message: 'Valid acccess token required' }
          req.user = user
          next()
        })
        .catch(next)
    } catch {
      next({ status: 401, message: 'Valid acccess token required' })
    }
  },

  authorizeTodo(req, res, next) {
    Todo.findById(req.params.id)
      .then(todo => {
        if (!todo) throw { status: 404, message: 'Todo not found' }
        else if (todo.creator == req.user.id) next()
        else if (!todo.group)
          throw { status: 403, message: 'Unauthorized access to this todo' }
        else {
          return Group.findById(todo.group).then(group => {
            if (!group) throw { status: 404, message: 'Group not found' }
            else if (
              group.members.includes(req.user.id) ||
              group.leader == req.user.id
            )
              next()
            else
              throw { status: 403, message: 'Unauthorized access to this todo' }
          })
        }
      })
      .catch(next)
  },

  authorizeGroup(req, res, next) {
    Group.findById(req.params.id)
      .then(group => {
        if (!group) throw { status: 404, message: 'Group not found' }
        if (
          group.leader == req.user.id ||
          group.members.includes(req.user.id)
        ) {
          req.group = group
          next()
        } else
          throw { status: 403, message: 'Unauthorized access to this group' }
      })
      .catch(next)
  },

  authorizeLeaderGroup(req, res, next) {
    if (req.group.leader == req.user.id) next()
    else next({ status: 403, message: 'Unauthorized access to this group' })
  }
}
