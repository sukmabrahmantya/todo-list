$(document).ready(() => {
  $(document).click(function(e) {
    $(`.navbar-collapse`).collapse('hide')
  })
  $('[data-toggle="tooltip"]').tooltip()
  checkSession()
})
