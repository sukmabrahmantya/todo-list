const { Group, User, Todo } = require('../models')

class GroupController {
  static createGroup(req, res, next) {
    Group.create({
      name: req.body.name,
      leader: req.user._id
    })
      .then(group => {
        return group
          .populate({ path: 'leader', select: '_id username email' })
          .execPopulate()
      })
      .then(group => {
        res.status(201).json({
          message: 'Group created',
          data: {
            _id: group._id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }

  static getAllUserGroups(req, res, next) {
    const as = req.query.as
    Group.find(
      as
        ? { [as]: req.user._id }
        : {
            $or: [{ leader: req.user._id }, { members: req.user._id }]
          }
    )
      .populate({ path: 'leader', select: '_id username email' })
      .populate({ path: 'members', select: '_id username email' })
      .then(groups => {
        res.status(200).json({
          data: groups.map(group => {
            return {
              _id: group.id,
              name: group.name,
              leader: group.leader,
              members: group.members
            }
          })
        })
      })
      .catch(next)
  }

  static getOneGroup(req, res, next) {
    Group.findById(req.params.id)
      .populate({ path: 'leader', select: '_id username email' })
      .populate({ path: 'members', select: '_id username email' })
      .then(group => {
        res.status(200).json({
          data: {
            _id: group.id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }

  static populateLeaderMember(group) {
    return Group.populate(group, {
      path: 'leader',
      select: '_id username email'
    }).then(group => {
      return Group.populate(group, {
        path: 'members',
        select: '_id username email'
      })
    })
  }

  static editGroupName(req, res, next) {
    if (!req.body.name) throw { status: 422, message: 'Group name required' }
    const group = req.group
    group.name = req.body.name
    group
      .save()
      .then(group => GroupController.populateLeaderMember(group))
      .then(group => {
        req.io.of(`/${group.id}`).emit('group-renamed', group)
        res.status(200).json({
          message: 'Group name updated',
          data: {
            _id: group.id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }

  static deleteGroup(req, res, next) {
    Group.findByIdAndDelete(req.params.id)
      .then(group => {
        req.io.emit('group-deleted', group)
        res.status(200).json({
          message: 'Group deleted'
        })
        return Todo.deleteMany({ group: group._id })
      })
      .then(x => {
        console.log('Deleted todos:', x)
      })
      .catch(next)
  }

  static inviteMember(req, res, next) {
    if (!req.body.email) throw { status: 422, message: 'Email required' }
    const group = req.group
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) throw { status: 404, message: 'User not found' }
        if (group.members.includes(user._id))
          throw { status: 422, message: 'User already invited' }
        group.members.push(user._id)
        return group.save()
      })
      .then(group => GroupController.populateLeaderMember(group))
      .then(group => {
        req.io.emit('member-invited', group)
        res.status(200).json({
          message: 'New member invited',
          data: {
            _id: group.id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }

  static kickMember(req, res, next) {
    const group = req.group
    if (!group.members.includes(req.params.member_id))
      throw { status: 422, message: 'Invalid member id' }
    group.members.pull(req.params.member_id)
    group
      .save()
      .then(group => GroupController.populateLeaderMember(group))
      .then(group => {
        req.io.emit('member-kicked', group)
        res.status(200).json({
          message: 'Member kicked',
          data: {
            _id: group.id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }

  static LeaveGroup(req, res, next) {
    const group = req.group
    console.log(!group.members.includes(req.user.id))
    if (!group.members.includes(req.user.id))
      throw { status: 422, message: 'Invalid member id' }
    group.members.pull(req.user.id)
    group
      .save()
      .then(group => GroupController.populateLeaderMember(group))
      .then(group => {
        req.io.of(`/${group.id}`).emit('member-left', group)
        res.status(200).json({
          message: 'You have left the group',
          data: {
            _id: group.id,
            name: group.name,
            leader: group.leader,
            members: group.members
          }
        })
      })
      .catch(next)
  }
}

module.exports = GroupController
