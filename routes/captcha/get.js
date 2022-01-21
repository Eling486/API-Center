const express = require('express');
const router = express.Router();
const { createCaptcha } = require('../utils/index')
const { encrypt } = require('../../utils')

/**
 * 获取验证码
 * /captcha/get?id=<id?>
 */
router.get('/', function(req, res, next) {
    let captcha = createCaptcha()
    console.log(captcha.text)
    if(req.query.id){
        let id = req.query.id
        let id_md5 = encrypt.md5(id)
        req.session[`captcha_${id_md5}`] = captcha.text
    }else{
        req.session.captcha = captcha.text
    }
    res.setHeader('Content-Type', 'image/svg+xml');
    res.write(captcha.data);
    res.end();
});

module.exports = router;
