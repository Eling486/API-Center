// 邮箱登录

const crypto = require('crypto')

module.exports = async (query, request) => {
  query.cookie['os'] = 'pc'
  const data = {
    username: query.username,
    password: crypto.createHash('md5').update(query.password).digest('hex'),
    rememberLogin: true,
    csrf_token: ''
  }

  let result = await request(
    'POST',
    'https://music.163.com/weapi/login',
    data,
    query.cookie
  )
  if (result.data.code === 502) {
    return {
      code: -502,
      msg: '账号或密码错误'
    }
  }
  console.log(result)
  if (result.data.code === 200) {
    return {
      code: 0,
      data: {
        id: result.data.account.id,
        nickname: result.data.profile.nickname,
        token: result.data.token
      }
    }
  }
  return result
}
