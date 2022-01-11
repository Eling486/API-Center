// 获取歌曲信息

const crypto = require('crypto')
const SongData = require('./songdata')

module.exports = async (query, request) => {
  const salt = 'CJBPACrRuNy7'
  const str = 'djp40ixkbuq'
  let id = query.id
  let mid = query.mid
  if (!query.id) {
    let song_data = await SongData(query, request)
    if (song_data.code !== 0) {
      return { code: 404 }
    }
    id = song_data.data.songid
  }
  const data = JSON.stringify({
    "comm": {
      "ct": 24,
      "cv": 0
    },
    "songinfo": {
      "module": "music.pf_song_detail_svr",
      "method": "get_song_detail_yqq",
      "param": {
        "song_type": 0,
        "song_mid": mid,
        "song_id": parseInt(id)
      }
    }
  })
  let sign_b = crypto.createHash('md5').update(`${salt}${data}`).digest("hex")
  let sign_a = `zza${sign_b.slice(4, 7)}${str}`
  let result = await request(
    'GET',
    `https://u.y.qq.com/cgi-bin/musics.fcg?sign=${sign_a}${sign_b}&data=${data}`,
    {},
    query.cookie
  )
  return result.data
}