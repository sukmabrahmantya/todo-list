let userId = ''

function checkSession(googleUser) {
  toast('Loading')
  const access_token = localStorage.getItem('access_token')
  if (googleUser && !sessionChecked) {
    sessionChecked = true
    // console.log('First check Session. Using gAuth')
    gAuth(googleUser)
  } else if (access_token && !sessionChecked) {
    sessionChecked = true
    // console.log('First check Session. Using access token')
    accessTokenAuth(access_token)
  } else {
    // console.log('Session checked or Access token or gAuth fail')
    Swal.close()
    toLandingPage()
  }
}

function accessTokenAuth(access_token) {
  const activePage = localStorage.getItem('active-page')
  $.ajax(`${baseUrl}/checksession`, {
    method: 'GET',
    headers: { access_token }
  })
    .done(({ data }) => {
      Swal.close()
      userId = data.id
      sessionChecked = false
      if (['landing-page', 'signup-page', 'signin-page'].includes(activePage)) {
        toDashboardPage()
      } else {
        switchPage(activePage)
      }
    })
    .fail(({ responseJSON }) => {
      console.log('Error from accessTokenAuth')
      toast(responseJSON, 5000)
      toLandingPage()
    })
}

function gAuth(googleUser) {
  g_token = googleUser.getAuthResponse().id_token
  $.ajax(`${baseUrl}/g-signin`, {
    method: 'POST',
    data: {
      g_token
    }
  })
    .done(({ data }) => {
      Swal.close()
      userId = data.id
      sessionChecked = false
      localStorage.setItem('access_token', data.access_token)
      const activePage = localStorage.getItem('active-page')
      if (['landing-page', 'signup-page', 'signin-page'].includes(activePage)) {
        toDashboardPage()
      } else {
        switchPage(activePage)
      }
    })
    .fail(({ responseJSON }) => {
      console.log('Error from gAuth')
      toast(responseJSON, 5000)
      toLandingPage()
    })
}

function onSignUp(e) {
  if (e) e.preventDefault()
  validateUsername(), validateEmail(), validatePassword()
  if ($('#signup-page .is-invalid').length > 0) return false
  const username = $('#signup-page #username')
  const email = $('#signup-page #email')
  const password = $('#signup-page #password')
  toast('Loading')
  $.ajax(`${baseUrl}/signup`, {
    method: 'POST',
    data: {
      username: username.val(),
      email: email.val(),
      password: password.val()
    }
  })
    .done(data => {
      toast('Sign up success!', 3000)
      toSignInPage()
    })
    .fail(({ responseJSON }) => {
      for (const msg of responseJSON) {
        if (msg.toLowerCase().includes('username'))
          username.addClass('is-invalid')
        if (msg.toLowerCase().includes('email')) email.addClass('is-invalid')
        if (msg.toLowerCase().includes('password'))
          password.addClass('is-invalid')
      }
      toast(responseJSON.join(', '), 5000)
    })
    .always(() => password.val(''))
  return false
}

function onSignIn(e) {
  toast('Loading')
  if (e) e.preventDefault()
  const emailUsername = $('#signin-page #emailUsername')
  const password = $('#signin-page #password')
  $.ajax(`${baseUrl}/signin`, {
    method: 'POST',
    data: {
      emailUsername: emailUsername.val(),
      password: password.val()
    }
  })
    .done(({ data }) => {
      toast('Sign in success!', 3000)
      localStorage.setItem('access_token', data.access_token)
      userId = data.id
      toDashboardPage()
    })
    .fail(({ responseJSON }) => {
      toast(responseJSON, 5000)
      emailUsername.addClass('is-invalid')
      password.addClass('is-invalid')
      emailUsername.one('focus', () => emailUsername.removeClass('is-invalid'))
      password.one('focus', () => password.removeClass('is-invalid'))
    })
    .always(() => password.val(''))
}

function onSignOut(e) {
  e.preventDefault()
  var auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(function() {
    console.log('User signed out.')
  })
  localStorage.removeItem('access_token')
  toast('Sign out success!', 3000)
  toLandingPage()
  return false
}

function switchPage(page) {
  switch (page) {
    case 'landing-page':
      toLandingPage()
      break
    case 'signup-page':
      toSignUpPage()
      break
    case 'signin-page':
      toSignInPage()
      break
    case 'dashboard-page':
      toDashboardPage()
      break
    case 'group-list-page':
      toGroupListPage()
      break
    case 'group-page':
      const groupId = localStorage.getItem('group_id')
      const groupName = localStorage.getItem('group_name')
      if (groupId && groupName) {
        toGroupPage(groupId, groupName)
      } else {
        toGroupListPage()
      }
      break

    default:
      toLandingPage()
      break
  }
}

/* Input Validation */
function validateUsername() {
  const page = localStorage.getItem('active-page')
  if (/^[a-zA-Z0-9_.]+$/.test($(`#${page} #username`).val())) {
    $(`#${page} #username`).removeClass('is-invalid')
  } else {
    $(`#${page} #username`).addClass('is-invalid')
  }
}

function validateEmail() {
  const page = localStorage.getItem('active-page')
  if (
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      $(`#${page} #email`).val()
    )
  ) {
    $(`#${page} #email`).removeClass('is-invalid')
  } else {
    $(`#${page} #email`).addClass('is-invalid')
  }
}

function validatePassword() {
  const page = localStorage.getItem('active-page')
  if ($(`#${page} #password`).val().length >= 6) {
    $(`#${page} #password`).removeClass('is-invalid')
  } else {
    $(`#${page} #password`).addClass('is-invalid')
  }
}
