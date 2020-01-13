let todos = []

function fetchCards(access_token) {
  toast('Loading')
  $.ajax(`${baseUrl}/user/todos?from=private`, {
    method: 'GET',
    headers: {
      access_token
    }
  })
    .done(({ data }) => {
      todos = data
      arrangeCards()
      Swal.close()
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
    })
}

function arrangeCards() {
  $('#todo-cards').empty()
  if (todos.length <= 0) {
    $('#todo-cards').append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3">
        <div
            class="card mb-4"
            style="min-width: 15rem; min-height: 18rem;"
          >
          <div class="card-body d-flex flex-column position-relative">
            <h5 class="mb-0">No TodolisT</h5>
            <p class="card-text">Looks like you don't have any Todo. <a href onclick="onOpenCreateModal(event)">Create one</a></p>
          </div>
        </div
      </div>
    `)
  }
  todos = sortTodos(todos)
  for (const todo of todos) {
    $('#todo-cards').append(`
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
      onOpenEditModal(todo)
      return false
    })

    $(`#delete-todo-${todo._id}`).click(todo, onDeleteTodo)

    if (new Date(todo.dueDate) < new Date()) {
      $(`#toggle-mark-${todo._id}`).remove()
    } else {
      $(`#toggle-mark-${todo._id}`).click(todo, onToggleMark)
    }
  }
}

function sortTodos(todos) {
  return todos
    .sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    .sort((a, b) => {
      return a.status == 'done' ? +1 : -1
    })
    .sort((a, b) => {
      return a.status == 'missed' ? +1 : -1
    })
}

// Event hanlders
function onOpenTodoModal() {
  $('#todo-modal').modal({
    backdrop: 'static'
  })
}

function onOpenEditModal(todo) {
  $('#todo-modal form').off('submit')
  $('#todo-modal form').on('submit', todo, onEditTodo)
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
    .click(todo, onEditTodo)
  onOpenTodoModal()
}

function onEditTodo(e) {
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
      todos = todos.map(todo => {
        return todo._id == data._id ? data : todo
      })
      arrangeCards()
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

function onDeleteTodo(e) {
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
          todos.splice(
            todos.findIndex(item => {
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

function onToggleMark(e) {
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

function onOpenCreateModal(e) {
  if (e) e.preventDefault()
  $('#todo-modal form').off('submit')
  $('#todo-modal form').on('submit', onCreateTodo)
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
    .click(onCreateTodo)
  onOpenTodoModal()
}

function onCreateTodo(e) {
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
  $.ajax(`${baseUrl}/todos`, {
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
      todos.push(data)
      arrangeCards()
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

// Validator
function validateTodoName() {
  if ($('#todo-modal #todo-name').val().length > 0) {
    $('#todo-modal #todo-name').removeClass('is-invalid')
  } else {
    $('#todo-modal #todo-name').addClass('is-invalid')
  }
}
