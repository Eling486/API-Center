const fs = require('fs')
const path = require('path')
const svgCaptcha = require('svg-captcha');

module.exports = {
    /**
     * 请求返回JSON
     * @param {*} res 
     * @param {Number} code 
     * @param {String} msg 
     * @param {*} data 
     */
    sendJSON: (res, code, msg = null, data = null) => {
        let json = {
            code: code
        }
        if (!msg) {
            if (code == 0) {
                json['msg'] = 'ok'
            } else {
                json['msg'] = 'error'
            }
        } else {
            json['msg'] = msg
        }
        if (data) {
            json['data'] = data
        }
        return res.json(json)
    },

    /**
     * 生成验证码
     */
    createCaptcha: () => {
        let captcha = svgCaptcha.create({
            inverse: false,
            size: 4,
            ignoreChars: '0oO1lI',
            fontSize: 36,
            noise: 3,
            width: 80,
            height: 30,
            color: true,
        });
        return {
            data: String(captcha.data),
            text: captcha.text.toLowerCase()
        }
    },
}