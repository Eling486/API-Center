const express = require('express');
const router = express.Router();
const request = require('./utils/request')
const { sendJSON } = require('../../utils/index')
const Detail = require('./modules/detail')
const Search = require('./modules/search')
const CheckMusic = require('./modules/check_music')
const Login = require('./modules/login')
const LoginRefresh = require('./modules/login_refresh')
const Url = require('./modules/url')

router.get('/',async function (req, res, next) {
    sendJSON(res, 0, '网易云音乐API正常运行中', {available: ['detail', 'check', 'search']});
    /*let data = await Login({
        username: '[username]',
        password: '[pwd]',
        cookie: {os: 'pc'}
    }, request)*/
});

router.get('/:module',async function (req, res, next) {
    let query = req.query
    query['cookie'] = {os: 'pc'}
    /**
     * 获取歌曲信息
     * @param {String} ids 网易云歌曲ID
     */
    if(req.params.module == 'detail'){
        let data = await Detail(query, request)
        if(data.code !== 0){
            return sendJSON(res, -502, `API调用失败: ${data.msg}`)
        }
        if(data.data.code == 200){
            return sendJSON(res, 0, null, data.data)
        }
        return sendJSON(res, -502, 'API调用失败')
    }
    /**
     * 检查歌曲状态
     * @param {String} id 网易云歌曲ID
     */
    if(req.params.module == 'check'){
        let data = await CheckMusic(query, request)
        if(data.code == -500){
            return sendJSON(res, -502, `API调用失败: ${data.msg}`)
        }
        return sendJSON(res, 0, null, data)
    }
    /**
     * 关键词搜索
     * @param {String} keywords 关键词
     */
    if(req.params.module == 'search'){
        let data = await Search(query, request)
        if(data.code == 200){
            return sendJSON(res, 0, null, data)
        }
        return sendJSON(res, -503, data.msg)
    }
    return sendJSON(res, -503, '该API不存在')
})
module.exports = router