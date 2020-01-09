'use strict'

module.exports = () => {
  const length = 8
  const chartset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*@#$%&+="
  let password = ""

  for (let i = 0, n = chartset.length; i < length; i++) {
    password += chartset.charAt(Math.floor(Math.random() * n))
  }

  return password
}