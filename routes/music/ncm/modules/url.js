// 歌曲链接

const crypto = require('crypto')

module.exports = async (query, request) => {
  query.cookie['os'] = 'pc'
  query.cookie['MUSIC_U'] = crypto.randomBytes(16).toString('hex')
  const data = {
    ids: '[' + query.id + ']',
    br: 999000,
  }
  let result = await request(
    'POST',
    `https://interface3.music.163.com/eapi/song/enhance/player/url`,
    data,
    query.cookie
  )
  console.log(result)
  return 'ok'
}