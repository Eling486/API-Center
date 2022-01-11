var express = require('express');
var router = express.Router();
const request = require('./utils/request')
const { sendJSON } = require('../../utils/index')
const Detail = require('./modules/detail')
const Url = require('./modules/url')
const Search = require('./modules/search')
const SongData = require('./modules/songdata')

router.get('/', function (req, res, next) {
    return sendJSON(res, 0, 'QQ音乐API正常运行中')
});

router.get('/:module', async function (req, res, next) {
    let query = req.query
    query['cookie'] = {}

    /**
     * GET 获取（爬取）歌曲数据
     * /music/ncm/songdata
     * @param {String} mid 歌曲mid
     * @param {String} id 歌曲id
     */
     if(req.params.module == 'songdata'){
        let data = await SongData(query, request)
        if(data.code == 0){
            return sendJSON(res, 0, null, data.data)
        }
        return sendJSON(res, -502, 'API调用失败')
    }

    /**
     * GET 获取歌曲信息
     * /music/ncm/detail
     * @param {Number} id 歌曲id
     * @param {String} mid 歌曲mid
     */
     if(req.params.module == 'detail'){
        let data = await Detail(query, request)
        if(data.code == 0){
            return sendJSON(res, 0, null, data.songinfo)
        }
        return sendJSON(res, -502, 'API调用失败')
    }

    /**
     * GET 获取歌曲播放链接
     * /music/ncm/url
     * @param {String} mid 歌曲mid
     */
     if(req.params.module == 'url'){
        let data = await Url(query, request)
        if(data.code == 0){
            if(data.req_0.data.midurlinfo[0].filename == ''){
                return sendJSON(res, -502, '歌曲不存在')
            }
            if(data.req_0.data.midurlinfo[0].purl == ''){
                return sendJSON(res, -502, '本歌曲为付费歌曲/无版权')
            }
            let baseUrl = data.req_0.data.sip[0]
            return sendJSON(res, 0, null, `${baseUrl}${data.req_0.data.midurlinfo[0].purl}`)
        }
        return sendJSON(res, -502, 'API调用失败')
    }

    /**
     * GET 搜索
     * /music/ncm/search
     * @param {String} keywords 关键词
     */
    if(req.params.module == 'search'){
        let data = await Search(query, request)
        if(data.code == 0){
            return sendJSON(res, 0, null, data.data)
        }
        return sendJSON(res, -502, 'API调用失败')
    }
})

module.exports = router