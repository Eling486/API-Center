const axios = require('axios')

const request = (method, url, data = null) => {
  return new Promise((resolve, reject) => {
    axios.request({
      url: url,
      method: method,
      data: data
    }).then(res => {
      return resolve(res)
    })
  })
}

module.exports = request