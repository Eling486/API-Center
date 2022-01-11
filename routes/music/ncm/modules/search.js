// 搜索

module.exports = async (query, request) => {
  query.cookie['os'] = 'pc'
  const data = {
    s: query.keywords,
    type: 1,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  let result = await request(
      'POST',
      `https://music.163.com/weapi/search/get`,
      data,
      query.cookie
    )
  return result.data
}