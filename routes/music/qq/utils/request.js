const axios = require('axios')
const crypto = require('crypto')
const qs = require('querystring')

const request = (method, url, data, cookie) => {
  return new Promise((resolve, reject) => {

    let cookie_str = ''
    for (let key in cookie){
      cookie_str += `${key}=${cookie[key]}; `
    }

    let url_str = encodeURI(url)
    axios.request({
      url: url_str,
      method: method,
      data: data,
      headers: {
        referer: 'https://y.qq.com/',
        cookie: cookie_str,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'
      }
    }).then(res => {
      return resolve(res)
    })
  })
}

module.exports = request