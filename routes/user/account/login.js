const express = require('express');
const router = express.Router();
var moment = require('moment');
moment.locale('zh-cn');
const crypto = require('crypto')
const { sendJSON, request } = require('../../utils/index')
const { wxAPI } = require('../../../utils/index')
const orm = require('../../../db/orm/index')

/**
 * 登录
 * POST
 * /user/account/login?type=<TYPE>
 */
router.post('/', async function (req, res) {
    try {
        let login_type = req.query.type

        if (login_type == 'wx') {
            // 微信登录
            let code = req.body.code

            let url = wxAPI.code2session(code)
            let result = await request('GET', url)

            let openid = result.data.openid
            let sessionKey = result.data.session_key

            /* 微信用户信息解密
            let encryptedData = new Buffer.from(req.body.encrypted_data, 'base64')
            let iv = new Buffer.from(req.body.iv, 'base64')
            let sessionKeyBuffer = new Buffer.from(sessionKey, 'base64')

            // 解密
            let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, iv)
            // 设置自动 padding 为 true，删除填充补位
            decipher.setAutoPadding(true)
            let decoded = decipher.update(encryptedData, 'utf8', 'binary')
            decoded += decipher.final('binary')

            decoded = JSON.parse(decoded)

            if (decoded.watermark.appid !== wxAPI.appId) {
                return sendJSON(res, -501, '用户数据不合法')
            }
            */

            let resultUid = await orm.User.getUid('openid', openid)
            if (resultUid.code === 0) {
                let uid = resultUid.data
                let user_info = await orm.User.get(uid)
                user_info = user_info.data

                await orm.User.set(uid, 'user', 'session_key', sessionKey)

                let login_time = moment().format('YYYY-MM-DD HH:mm:ss')
                req.session.user = {
                    uid: user_info.uid,
                    username: user_info.username,
                    nickname: user_info.nickname,
                    openid: user_info.openid,
                    user_type: user_info.user_type
                }
                let data = {
                    uid: user_info.uid,
                    username: user_info.username,
                    nickname: user_info.nickname,
                    openid: user_info.openid,
                    user_type: user_info.user_type,
                    login_time: login_time
                }
                return sendJSON(res, 0, '登录成功', data)
            }
            if (result.code === -2) {
                return sendJSON(res, -50201, '用户未注册')
            }
            return sendJSON(res, -500, '服务端异常')
        } else {
            // 其他方式登录
            let username = req.body.username
            let email = req.body.email
            let mobile_phone = req.body.mobile_phone
            let password = req.body.password

            let result
            if (username) {
                result = await orm.User.getUid('username', username)
            } else if (email) {
                result = await orm.User.getUid('email', email)
            } else if (mobile_phone) {
                result = await orm.User.getUid('mobile_phone', mobile_phone)
            }
            if (result.code === 0) {
                let uid = result.data
                let pwd = await orm.User.get(uid, 'password')
                if (pwd.data === password) {
                    let user_info = await orm.User.get(uid)
                    user_info = user_info.data
                    let login_time = moment().format('YYYY-MM-DD HH:mm:ss')
                    req.session.username = user_info['username'];
                    req.session.uid = user_info.uid;
                    req.session.user_type = user_info.user_type
                    let data = {
                        uid: user_info.uid,
                        username: user_info.username,
                        login_time: login_time
                    }
                    return sendJSON(res, 0, '登录成功', data)
                } else {
                    return sendJSON(res, -50202, '用户名或密码错误')
                }
            }
            if (result.code === -2) {
                return sendJSON(res, -50201, '用户不存在')
            }
        }
    } catch (err) {
        console.log(err)
        return sendJSON(res, -500, '服务端异常')
    }
})

module.exports = router;
