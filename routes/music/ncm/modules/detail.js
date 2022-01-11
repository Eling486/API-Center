// 获取歌曲信息

module.exports = async (query, request) => {
  try {
    if(!query.ids){
      throw '参数错误！可选的参数：ids'
    }
    query.cookie['os'] = 'pc'
    query.ids = query.ids.split(/\s*,\s*/)
    const data = {
      c: '[' + query.ids.map((id) => '{"id":' + id + '}').join(',') + ']',
    }
    let result = await request(
      'POST',
      `https://music.163.com/weapi/v3/song/detail`,
      data,
      query.cookie
    )
    if (result.data.code === 200) {
      return {
        code: 0,
        data: result.data
      }
    }
  } catch(e) {
    return {
      code: -500,
      msg: e
    }
  }
}
