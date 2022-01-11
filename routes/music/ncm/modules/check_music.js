// 检查歌曲状态

module.exports = async (query, request) => {
  try {
    query.cookie['os'] = 'pc'
    if(!query.id){
      throw '参数错误！可选的参数：id'
    }
    const data = {
      ids: '[' + parseInt(query.id) + ']',
      br: parseInt(999000),
    }
    let result = await request(
      'POST',
      `https://music.163.com/weapi/song/enhance/player/url`,
      data,
      query.cookie,
    )
    let music_type = 0
    // console.log(result.data)
    if (result.data.code == 200) {
      if (result.data.data[0].code == 200) {
        music_type = 1
      }
      if (result.data.data[0].code == -110) {
        music_type = 2
      }
    }
    if (music_type === 1) {
      return { code: 0, msg: '版权正常' }
    }
    if (music_type === 2) {
      return { code: -110, msg: '需要会员' }
    }
    if (music_type === 0) {
      return { code: -404, msg: '暂无版权' }
    }
  } catch (e) {
    return { code: -500, msg: e }
  }
}
