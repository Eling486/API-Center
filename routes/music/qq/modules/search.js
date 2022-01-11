// 搜索

module.exports = async (query, request) => {
  if(!query.keywords){
    return {code: 404}
  }
  let result = await request(
      'GET',
      `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?new_json=1&p=${query.page || 1}&n=${query.perPage || 10}&w=${query.keywords}`,
      {},
      query.cookie
    )

  let callback_f = 'function callback(item){return JSON.parse(JSON.stringify(item))};'
  let data = eval(callback_f + result.data)
  return data
}