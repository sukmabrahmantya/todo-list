const baseUrl = 'http://localhost:3000'

function toast(title, timer) {
  return Swal.fire({
    title: title == 'Loading' ? '' : title,
    html:
      title == 'Loading'
        ? title + '... <span class="spinner-border spinner-border-sm"></span>'
        : undefined,
    timer,
    showConfirmButton: false,
    toast: true,
    position: 'bottom',
    showClass: {
      popup: 'animated fadeInUp faster'
    },
    hideClass: {
      popup: 'animated fadeOutDown faster'
    }
  })
}
