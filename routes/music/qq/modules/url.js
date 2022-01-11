// 获取歌曲信息

const crypto = require('crypto')
const SongData = require('./songdata')

module.exports = async (query, request) => {
  const salt = 'CJBPACrRuNy7'
  const str = 'djp40ixkbuq'
  let mid = query.mid
  if(!mid){
    let song_data = await SongData(query, request)
    if(song_data.code !== 0){
      return {code: 404}
    }
    mid = song_data.data.songmid
  }
  const data = JSON.stringify({
    "comm": {
      "uin": 0,
      "format": "json",
      "ct": 24,
      "cv": 0
    },
    "req": {
      "module": "CDN.SrfCdnDispatchServer",
      "method": "GetCdnDispatch",
      "param": {
        "guid": "3027583994",
        "calltype": 0,
        "userip": ""
      }
    },
    "req_0": {
      "module": "vkey.GetVkeyServer",
      "method": "CgiGetVkey",
      "param": {
        "guid": "3027583994",
        "songmid": [`${mid}`],
        "songtype": [0],
        "uin": "0",
        "loginflag": 1,
        "platform": "20"
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
  if(result.data.code == 0){
    return result.data
  }
  return { code: 404 }
}