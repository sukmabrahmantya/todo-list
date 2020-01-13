let groups = []
let groupTodos = []
let groupMembers = []
let leaderId = ''
let groupSocket = null
let globalSocket = null

// Group List Page
function fetchGroup(access_token) {
  toast('Loading')
  $.ajax(`${baseUrl}/user/groups`, {
    method: 'GET',
    headers: {
      access_token
    }
  })
    .done(({ data }) => {
      groups = data
      enlistGroups()
      Swal.close()
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
    })
}

function enlistGroups() {
  $('#group-list').empty()
  for (const group of groups) {
    $('#group-list').append(`
      <tr onclick="toGroupPage('${group._id}', '${group.name}')">
        <td>${group.name}</td>
        <td>${group.leader.username}</td>
        <td>${group.members.length}</td>
      </tr>
    `)
  }
}

function onCreateGroup(e) {
  if (e) e.preventDefault()
  $('#btn-group-create').empty().append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Creating...
  `)
  const groupName = $('#group-list-page #group-name')
  if (!groupName.val()) {
    groupName
      .addClass('is-invalid')
      .focusin(() => groupName.removeClass('is-invalid'))
    $('#btn-group-create')
      .empty()
      .append('Create New Group')
    return false
  }
  const access_token = localStorage.getItem('access_token')
  $.ajax(`${baseUrl}/groups`, {
    method: 'POST',
    headers: { access_token },
    data: {
      name: groupName.val()
    }
  })
    .done(({ data }) => {
      toast('New group created', 3000)
      $('#btn-group-create')
        .empty()
        .append('Create New Group')
      groups.push(data)
      enlistGroups()
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
      $('#btn-group-create')
        .empty()
        .append('Create New Group')
    })
    .always(() => {
      groupName.val('')
    })
  return false
}

// Group Page
function fetchGroupDetails(access_token) {
  toast('Loading')
  $('#form-invite-member').show()
  $('#form-rename-group').show()
  $('#danger-area .btn').show()
  toTodoCardsSection()
  const groupId = localStorage.getItem('group_id')
  groupSocket = setGroupIoListener(groupId)
  $.ajax(`${baseUrl}/groups/${groupId}/todos`, {
    method: 'GET',
    headers: {
      access_token
    }
  })
    .done(({ data }) => {
      groupTodos = data
      arrangeGroupCards()
      Swal.close()
    })
    .fail(({ responseJSON }) => {
      console.log('Error from fetchGroupDetails1')
      toast(responseJSON, 5000)
    })

  $.ajax(`${baseUrl}/groups/${groupId}`, {
    method: 'GET',
    headers: {
      access_token
    }
  })
    .done(({ data }) => {
      leaderId = data.leader._id
      if (leaderId !== userId) {
        $('#form-invite-member').hide()
        $('#form-rename-group').hide()
        $('#btn-delete-group').hide()
      } else $('#btn-leave-group').hide()
      groupMembers = data.members || []
      enlistGroupMembers()
      Swal.close()
    })
    .fail(({ responseJSON }) => {
      console.log('Error from fetchGroupDetails2')
      toast(responseJSON, 5000)
    })

  $.ajax(`${baseUrl}/user`, {
    method: 'GET',
    headers: { access_token }
  })
    .done(({ data }) => {
      $('#user-list-to-invite').empty()
      for (const user of data) {
        $('#user-list-to-invite').append(`
        <option value="${user.email}"></option>
      `)
      }
    })
    .fail(({ responseJSON }) => {
      console.log('Error from fetchGroupDetails3')
      toast(responseJSON, 5000)
    })
}

function arrangeGroupCards() {
  groupTodos = sortTodos(groupTodos)
  $('#group-todo-cards').empty()
  for (const todo of groupTodos) {
    $('#group-todo-cards').append(`
        <div class="col-12 col-md-6 col-lg-4 col-xl-3" id="${todo._id}">
          <div
            class="card mb-4"
            style="min-width: 15rem; min-height: 18rem;"
          >
            <div class="card-body d-flex flex-column position-relative">
              <div class="card-title">
                <h5 class="mb-0">${todo.name}</h5>
                <small class="d-block todo-status ${
                  todo.status == 'missed'
                    ? 'text-danger'
                    : todo.status == 'done'
                    ? 'text-success'
                    : 'text-muted'
                }">Status: ${todo.status}</small>
                <small class ="mt-0 text-muted">Due: ${moment(
                  todo.dueDate
                ).format('ddd, MMM Do YYYY')}</small>
                <div
                  class="position-absolute"
                  style="font-size: large; top: 1rem; right: 1rem;"
                  id="edit-todo-${todo._id}"
                >
                  <a href=""><i class="fas fa-edit text-muted"></i></a>
                </div>
              </div>
              <p class="card-text">
                ${todo.description || 'No description'}
              </p>
              <div class="mt-auto">
                <p class="card-text">
                  <small class="todo-last-update text-muted">${moment(
                    todo.updatedAt
                  ).fromNow()}</small>
                  <br/>
                  <small class="text-muted">By: ${todo.creator.email}</small>
                </p>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-danger" id="delete-todo-${todo._id}">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button class="btn btn-success" id="toggle-mark-${todo._id}">
                ${
                  todo.status == 'pending'
                    ? 'Mark Done'
                    : todo.status == 'done'
                    ? 'Mark Undone'
                    : ''
                }
              </button>
            </div>
          </div>
        </div>
      `)

    $(`#edit-todo-${todo._id}`).click(function(e) {
      e.preventDefault()
      onGroupOpenEditModal(todo)
      return false
    })

    $(`#delete-todo-${todo._id}`).click(todo, onGroupDeleteTodo)

    if (new Date(todo.dueDate) < new Date()) {
      $(`#toggle-mark-${todo._id}`).remove()
    } else {
      $(`#toggle-mark-${todo._id}`).click(todo, onGroupToggleMark)
    }
  }
}

function enlistGroupMembers() {
  $('#group-member-list').empty()
  for (const member of groupMembers) {
    $('#group-member-list').append(`
      <tr>
        <td>${member.email}</td>
        <td><button class="btn btn-danger" ${
          leaderId != userId ? 'disabled' : ''
        } id="btn-kick-member-${member._id}">Kick</button></td>
      </tr>
    `)
    if (leaderId == userId) {
      $(`#btn-kick-member-${member._id}`).click(member, onKickMember)
    }
  }
}

function toTodoCardsSection(e) {
  if (e) e.preventDefault()
  $('#group-page .group-section').hide()
  $('#group-page #todo-cards-section').show()
  $('#group-page .nav-link').removeClass('active')
  $('#group-page #group-nav-todos').addClass('active')
}

function toMemberListSection(e) {
  if (e) e.preventDefault()
  $('#group-page .group-section').hide()
  $('#group-page #member-list-section').show()
  $('#group-page .nav-link').removeClass('active')
  $('#group-page #group-nav-members').addClass('active')
}

function toGroupSettingSection(e) {
  if (e) e.preventDefault()
  $('#group-page .group-section').hide()
  $('#group-page #group-setting-section').show()
  $('#group-page .nav-link').removeClass('active')
  $('#group-page #group-nav-setting').addClass('active')
}

function onGroupOpenCreateModal(e) {
  if (e) e.preventDefault()
  $('#todo-modal form').off('submit')
  $('#todo-modal form').on('submit', onCreateGroupTodo)
  $('#todo-modal').on('hidden.bs.modal', function(e) {
    $('#todo-modal #todo-name').val('')
    $('#todo-modal #todo-desc').val('')
    $('#todo-modal #todo-due').val('')
    $('#btn-todo-submit')
      .empty()
      .append('Create')
  })
  $('#todo-modal #todo-name').val('')
  $('#todo-modal #todo-desc').val('')
  $('#todo-modal #todo-due').val('')
  $('#btn-todo-submit')
    .empty()
    .append('Create')
    .off('click')
    .click(onCreateGroupTodo)
  onOpenTodoModal()
}

function onCreateGroupTodo(e) {
  if (e) e.preventDefault()
  $('#btn-todo-submit').empty().append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Creating...
  `)
  validateTodoName()
  if ($('#todo-modal .is-invalid').length > 0) {
    $('#btn-todo-submit')
      .empty()
      .append('Create')
    return false
  }
  const name = $('#todo-modal #todo-name')
  const description = $('#todo-modal #todo-desc')
  const dueDate = $('#todo-modal #todo-due')
  const access_token = localStorage.getItem('access_token')
  const groupId = localStorage.getItem('group_id')
  $.ajax(`${baseUrl}/groups/${groupId}/todos`, {
    method: 'POST',
    headers: {
      access_token
    },
    data: {
      name: name.val(),
      description: description.val() || undefined,
      dueDate: dueDate.val() || undefined
    }
  })
    .done(({ data }) => {
      // groupTodos.push(data)
      // arrangeGroupCards()
      $('#todo-modal').modal('hide')
      toast('New todo created', 3000)
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON.join(', '), 5000)
    })
    .always(() => {
      $('#btn-todo-submit')
        .empty()
        .append('Create')
    })
  return false
}

function onGroupOpenEditModal(todo) {
  $('#todo-modal form').off('submit')
  $('#todo-modal form').on('submit', todo, onEditGroupTodo)
  $('#todo-modal').on('hidden.bs.modal', function(e) {
    $('#todo-modal #todo-name').val('')
    $('#todo-modal #todo-desc').val('')
    $('#todo-modal #todo-due').val('')
    $('#btn-todo-submit')
      .empty()
      .append('Create')
  })
  $('#todo-modal #todo-name').val(todo.name)
  $('#todo-modal #todo-desc').val(todo.description)
  $('#todo-modal #todo-due').val(moment(todo.dueDate).format('YYYY-MM-DD'))
  $('#btn-todo-submit')
    .empty()
    .append('Edit')
    .off('click')
    .click(todo, onEditGroupTodo)
  onOpenTodoModal()
}

function onEditGroupTodo(e) {
  if (e) e.preventDefault()
  $('#btn-todo-submit').empty().append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Updating...
  `)
  validateTodoName()
  if ($('#todo-modal .is-invalid').length > 0) {
    $('#btn-todo-submit')
      .empty()
      .append('Edit')
    return false
  }
  const name = $('#todo-modal #todo-name')
  const description = $('#todo-modal #todo-desc')
  const dueDate = $('#todo-modal #todo-due')
  const access_token = localStorage.getItem('access_token')
  $.ajax(`${baseUrl}/todos/${e.data._id}`, {
    method: 'PUT',
    headers: {
      access_token
    },
    data: {
      name: name.val(),
      description: description.val() || undefined,
      dueDate: dueDate.val() || undefined
    }
  })
    .done(({ data }) => {
      groupTodos = groupTodos.map(todo => {
        return todo._id == data._id ? data : todo
      })
      arrangeGroupCards()
      $('#todo-modal').modal('hide')
      toast('Todo updated!', 3000)
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
    })
    .always(() => {
      $('#btn-todo-submit')
        .empty()
        .append('Edit')
    })
  return false
}

function onGroupDeleteTodo(e) {
  const todo = e.data
  Swal.fire({
    title: 'Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#007bff',
    reverseButtons: true,
    confirmButtonText: 'Delete',
    focusConfirm: false,
    focusCancel: true
  }).then(result => {
    if (result.value) {
      toast('Loading')
      $.ajax(`${baseUrl}/todos/${todo._id}`, {
        method: 'DELETE',
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .done(() => {
          groupTodos.splice(
            groupTodos.findIndex(item => {
              return item._id == todo._id
            }),
            1
          )
          $(`#${todo._id}`).remove()
          toast('Todo deleted!', 5000)
        })
        .fail(({ responseJSON }) => {
          toast(responseJSON, 5000)
        })
    }
  })
}

function onGroupToggleMark(e) {
  const todo = e.data
  toast('Loading')
  $.ajax(`${baseUrl}/todos/${todo._id}/status`, {
    method: 'PATCH',
    headers: {
      access_token: localStorage.getItem('access_token')
    }
  })
    .done(({ data }) => {
      $(`#${data._id} .todo-status`)
        .removeClass()
        .addClass(
          `d-block todo-status ${
            data.status == 'missed'
              ? 'text-danger'
              : data.status == 'done'
              ? 'text-success'
              : 'text-muted'
          }`
        )
        .text(`Status: ${data.status}`)

      $(`#toggle-mark-${data._id}`).text(
        `${
          data.status == 'pending'
            ? 'Mark Done'
            : data.status == 'done'
            ? 'Mark Undone'
            : ''
        }`
      )
      $(`#${data._id} .todo-last-update`).text(moment(data.updatedAt).fromNow())
      toast(`Todo marked as ${data.status}`, 3000)
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
    })
}

function onInviteMember(e) {
  if (e) e.preventDefault()
  $('#btn-member-invite').empty().append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Creating...
  `)
  const inviteEmail = $('#group-page #invite-email')
  if (!inviteEmail.val()) {
    inviteEmail
      .addClass('is-invalid')
      .focusin(() => inviteEmail.removeClass('is-invalid'))
    $('#btn-member-invite')
      .empty()
      .append('Invite Member')
    return false
  }
  const access_token = localStorage.getItem('access_token')
  const groupId = localStorage.getItem('group_id')
  $.ajax(`${baseUrl}/groups/${groupId}/members`, {
    method: 'PATCH',
    headers: { access_token },
    data: {
      email: inviteEmail.val()
    }
  })
    .done(({ data }) => {
      toast('New member invited', 3000)
      $('#btn-member-invite')
        .empty()
        .append('Invite Member')
      groupMembers = data.members
      enlistGroupMembers()
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
      $('#btn-member-invite')
        .empty()
        .append('Invite Member')
    })
    .always(() => {
      inviteEmail.val('')
    })
  return false
}

function onKickMember(e) {
  Swal.fire({
    title: 'Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#007bff',
    reverseButtons: true,
    confirmButtonText: 'Delete',
    focusConfirm: false,
    focusCancel: true
  }).then(result => {
    if (result.value) {
      toast('Loading')
      const access_token = localStorage.getItem('access_token')
      const groupId = localStorage.getItem('group_id')
      $.ajax(`${baseUrl}/groups/${groupId}/members/${e.data._id}`, {
        method: 'DELETE',
        headers: { access_token }
      })
        .done(({ data }) => {
          toast('Member Kicked', 5000)
          groupMembers = data.members
          enlistGroupMembers()
        })
        .fail(({ responseJSON }) => {
          toast(responseJSON, 5000)
        })
    }
  })
}

function onLeaveGroup(e) {
  if (e) e.preventDefault()
  Swal.fire({
    title: 'Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#007bff',
    reverseButtons: true,
    confirmButtonText: 'Delete',
    focusConfirm: false,
    focusCancel: true
  }).then(result => {
    if (result.value) {
      toast('Loading')
      const access_token = localStorage.getItem('access_token')
      const groupId = localStorage.getItem('group_id')
      $.ajax(`${baseUrl}/groups/${groupId}/leave`, {
        method: 'DELETE',
        headers: { access_token }
      })
        .done(({ data }) => {
          toast('You have left the group!', 5000)
          toGroupListPage()
        })
        .fail(({ responseJSON }) => {
          toast(responseJSON, 5000)
        })
    }
  })
}

function onRenameGroup(e) {
  if (e) e.preventDefault()
  $('#btn-rename-group').empty().append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Renaming...
  `)
  const renameGroup = $('#group-page #rename-group')
  if (!renameGroup.val()) {
    renameGroup
      .addClass('is-invalid')
      .focusin(() => renameGroup.removeClass('is-invalid'))
    $('#btn-rename-group')
      .empty()
      .append('Rename Group')
    return false
  }
  const access_token = localStorage.getItem('access_token')
  const groupId = localStorage.getItem('group_id')
  $.ajax(`${baseUrl}/groups/${groupId}`, {
    method: 'PATCH',
    headers: { access_token },
    data: {
      name: renameGroup.val()
    }
  })
    .done(({ data }) => {
      toast('Group renamed!', 3000)
      $('#btn-rename-group')
        .empty()
        .append('Rename Group')
      localStorage.setItem('group_name', data.name)
      $('#group-page .jumbotron .container')
        .empty()
        .append(`<h1>${data.name}</h1>`)
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
      $('#btn-rename-group')
        .empty()
        .append('Rename Group')
    })
    .always(() => {
      renameGroup.val('')
    })
  return false
}

function onDeleteGroup(e) {
  if (e) e.preventDefault()
  Swal.fire({
    title: 'Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#007bff',
    reverseButtons: true,
    confirmButtonText: 'Delete',
    focusConfirm: false,
    focusCancel: true
  }).then(result => {
    if (result.value) {
      toast('Loading')
      const access_token = localStorage.getItem('access_token')
      const groupId = localStorage.getItem('group_id')
      $.ajax(`${baseUrl}/groups/${groupId}`, {
        method: 'DELETE',
        headers: { access_token }
      })
        .done(({ data }) => {
          toast('Group deleted!', 5000)
          toGroupListPage()
        })
        .fail(({ responseJSON }) => {
          toast(responseJSON, 5000)
        })
    }
  })
}

function setGroupIoListener(groupId) {
  const socket = io(`${baseUrl}/${groupId}`)

  socket.on('created-group-todo', todo => {
    toast('New todo created!', 5000)
    groupTodos.push(todo)
    console.log(groupTodos)
    arrangeGroupCards()
  })

  socket.on('updated-group-todo', updatedTodo => {
    // toast('ga ke sini?', 3000)
    toast('Todo updated!', 3000)
    groupTodos = groupTodos.map(todo => {
      return todo._id == updatedTodo._id ? updatedTodo : todo
    })
    arrangeGroupCards()
  })

  socket.on('deleted-group-todo', deletedTodo => {
    toast('Todo deleted!', 5000)
    groupTodos.splice(
      groupTodos.findIndex(item => {
        return item._id == deletedTodo._id
      }),
      1
    )
    $(`#${deletedTodo._id}`).remove()
  })

  socket.on('group-renamed', renamedGroup => {
    toast('Group renamed!', 3000)
    localStorage.setItem('group_name', renamedGroup.name)
    $('#group-page .jumbotron .container')
      .empty()
      .append(`<h1>${renamedGroup.name}</h1>`)
  })

  socket.on('member-left', group => {
    toast('Member left', 3000)
    groupMembers = group.members
    enlistGroupMembers()
  })

  return socket
}

function setGlobalIoListener() {
  const socket = io(`${baseUrl}`)
  socket.on('member-invited', group => {
    fetchGroup(localStorage.getItem('access_token')) // This to handle user that's on Group List Page to be notified if he's invited to a group
    groupMembers = group.members
    enlistGroupMembers()
  })

  socket.on('member-kicked', group => {
    if (
      group.members.map(member => member._id).includes(userId) ||
      userId == leaderId
    ) {
      groupMembers = group.members
      enlistGroupMembers()
    } else {
      toast('You have been kicked from group ' + group.name, 3000)
      toGroupListPage()
    }
  })

  socket.on('group-deleted', group => {
    if (
      localStorage.getItem('active-page') == 'group-page' &&
      localStorage.getItem('group_id') == group._id
    ) {
      toast('Group deleted!', 5000)
      toGroupListPage()
    } else fetchGroup(localStorage.getItem('access_token'))
  })

  return socket
}
