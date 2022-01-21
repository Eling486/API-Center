const express = require('express');
const router = express.Router();
const { encrypt } = require('../../utils')
const { sendJSON } = require('../utils/index')

/**
 * 获取验证码
 * /captcha/check?id=<id?>
 */
router.get('/', function (req, res, next) {
    try {
        let answer
        if (req.query.id) {
            let id = req.query.id
            let id_md5 = encrypt.md5(id)
            answer = req.session[`captcha_${id_md5}`]
        } else {
            answer = req.session.captcha
        }
        let text = req.query.text
        let text_md5 = encrypt.md5(text)
        let answer_md5 = encrypt.md5(answer)
        if (!answer) {
            throw { code: -50401, msg: '请重新请求验证码' }
        }
        if (!text) {
            throw { code: -502, msg: '请输入验证码' }
        }
        if (text_md5 !== answer_md5) {
            throw { code: -501, msg: '验证码错误' }
        }
        return sendJSON(res, 0, '验证码正确')
    } catch (e) {
        if (e.code && e.msg) {
            return sendJSON(res, e.code, e.msg)
        }
        return sendJSON(res, -500, '服务端异常')
    }
});

module.exports = router;
