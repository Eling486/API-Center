// 刷新登录

module.exports = async (query, request) => {
  query.cookie['os'] = 'pc'
  let result = await request(
      'POST',
      `https://music.163.com/weapi/login/token/refresh?csrf_token=${query.token}`,
      {},
      query.cookie
    )
    console.log(result)
  return result.data
}