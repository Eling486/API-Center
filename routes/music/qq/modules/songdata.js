// 获取歌曲ID

module.exports = async (query, request) => {

  async function songData(query, request) {
    let url
    let mode = 1
    if (query.id) {
      url = `https://i.y.qq.com/v8/playsong.html?songid=${query.id}&source=yqq`
    }
    if (query.mid) {
      url = `https://y.qq.com/n/yqq/song/${query.mid}.html`
      mode = 2
    }
    let result = await request(
      'GET',
      url,
      {},
      query.cookie
    )
    if (mode === 1) {
      const reg1 = new RegExp(/mid&#61;(.*)&#38;/g)
      let mid = result.data.match(reg1)
      if (mid.length === 0) {
        return { code: 404 }
      }
      mid = mid[0].split(';')[1].split('&#')[0]
      query['mid'] = mid
      return await songData(query, request)
    }
    if (mode === 2) {
      const reg2 = new RegExp(/var g_SongData = .*;/g)
      let data = result.data.match(reg2)
      if (data.length === 0) {
        return { code: 404 }
      }
      data = data[0]
      f = 'function a(item){return JSON.parse(JSON.stringify(item))};a(g_SongData)'
      data = eval(`${data}${f}`)
      return { code: 0, data: data }
    }
  }
  try{
    return await songData(query, request)
  }catch{
    return { code: 404 }
  }
}