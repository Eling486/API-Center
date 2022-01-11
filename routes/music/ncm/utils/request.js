const axios = require('axios')
const crypto = require('crypto')
const qs = require('querystring')
const { rsa, aes } = require('./encrypt')

const request = (method, url, data, cookie) => {
  return new Promise((resolve, reject) => {
    const data_str = JSON.stringify(data)
    const salt = '2VRpcLApaHXPa8Rj'

    let cookie_str = ''
    for (let key in cookie){
      cookie_str += `${key}=${cookie[key]}; `
    }
    axios.request({
      url: url,
      method: method,
      data: qs.stringify({
        params: aes(aes(data_str, '0CoJUm6Qyw8W8jud'), salt),
        encSecKey: rsa(Buffer.from('jR8aPXHapALcpRV2'.padStart(128, '\0')))
      }),
      headers: {
        referer: 'https://music.163.com/',
        cookie: cookie_str,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'
      }
    }).then(res => {
      return resolve(res)
    })
  })
}

module.exports = request