const express = require('express');
const router = express.Router();
const { sendJSON } = require('../../../utils/index')
const orm = require('../../../../db/orm/index')
const util = require('../../../../utils/index')

/**
 * 注册
 * POST
 * /user/account/register/new?type=<TYPE>
 */
router.post('/', async function (req, res, next) {
  try {
    let reg_type = req.query.type
    let sign = req.query.sign

    let data_sign = util.encrypt.md5(JSON.stringify(req.body))

    if (data_sign !== sign) {
      return sendJSON(res, -50201, '数据不合法')
    }

    if (reg_type == 'wx') {
      return wechatRegister(req, res)
    }

    let username = req.body.username
    let email = req.body.email
    let mobile_phone = req.body.mobile_phone
    let password = req.body.password
    let user_type = req.body.user_type
    let realname = req.body.realname
    let stu_id = req.body.student_id

    if (!username) {
      return sendJSON(res, -50202, '请输入用户名')
    }
    if (username.length < 2 || username.length > 16) {
      return sendJSON(res, -50201, '数据不合法')
    }
    let username_result = await orm.User.get('user', 'username', username)
    if (username_result.code !== -2) {
      return sendJSON(res, -50203, '用户名已存在')
    }

    if (!password || password.length !== 32) {
      return sendJSON(res, -50204, '请输入密码/密码格式有误')
    }

    if (!email && !mobile_phone) {
      return sendJSON(res, -50205, '请输入邮箱/手机号')
    }
    if (email) {
      let email_result = await orm.User.get('user', 'email', email)
      if (email_result.code !== -2) {
        return sendJSON(res, -50206, '该邮箱已被注册')
      }
      const reg_email = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z.]{2,6})$/;
      if (!reg_email.test(email)) {
        return sendJSON(res, -50201, '数据不合法')
      }
    }
    if (mobile_phone) {
      let phone_result = await orm.User.get('user', 'mobile_phone', mobile_phone)
      if (phone_result.code !== -2) {
        return sendJSON(res, -50207, '该手机号已被注册')
      }
    }

    if (!realname) {
      return sendJSON(res, -50208, '请输入真实姓名')
    }
    const reg_realname = /^[\u4e00-\u9fa5|·]{0,}$/;
    if (!reg_realname.test(realname) || realname.length < 2) {
      return sendJSON(res, -50201, '数据不合法')
    }

    if (user_type == 1 && !stu_id) {
      return sendJSON(res, -50209, '请输入6位学号')
    }
    if (stu_id && stu_id.length !== 6) {
      return sendJSON(res, -50201, '数据不合法')
    }

    let user = {
      username: username,
      password: password,
      email: email || null,
      mobile_phone: mobile_phone || null,
      user_type: 1,
      reg_time: new Date(),
      nickname: username,
      stu_id: stu_id || null,
      realname: realname,
    }

    if (reg_type == 'teacher' && user_type == 2) {
      user['user_type'] = 2
    }

    let reg_result = await orm.User.add(user)
    if(reg_result.code === 0){
      return sendJSON(res, 0, '注册成功')
    }
    return sendJSON(res, -500, '注册失败')
  } catch (err) {
    console.log(err)
    return sendJSON(res, -500, '服务端异常')
  }
});

function wechatRegister(req, res) {
  let code = req.body.code

  // TODO: 微信注册

  return sendJSON(res, 0, '注册成功')
}

module.exports = router;
