const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../utils/index')

/**
 * 注册信息快速验证
 * POST
 * /user/account/register/validate?target=<TARGET>
 */
router.get('/', function (req, res, next) {
    let target = req.query.target
    if (target == 'username') {
        return sendJSON(res, 0, '验证通过')
    }
    if (target == 'mobile_phone') {
        return sendJSON(res, -50204, '手机号已被占用')
    }
    if (target == 'email') {
        return sendJSON(res, 0, '验证通过')
    }
    if(!target){
        return sendJSON(res, -503, '参数有误')
    }
    return sendJSON(res, -500, '服务端异常')
});

module.exports = router;
