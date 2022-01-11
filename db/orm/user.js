const db = require('../index')

const User = {
    /**
     * 按uid获取用户信息
     * @param {Number} uid
     * @param {String} key 
     */
    getUser: (uid, key = '') => {
        return new Promise((resolve, reject) => {
            let data = {
                uid: uid
            }
            db.querySQL({
                sql: "SELECT * FROM user WHERE uid = ?",
                values: [uid],
                timeout: 40000,
            }, function (err, result) {
                if (err) {
                    return reject({ code: -1, msg: err })
                }
                if (result.length == 0) {
                    return resolve({ code: -1, msg: 'uid不存在' })
                }

                data['username'] = result[0].username
                data['password'] = result[0].password
                data['user_state'] = result[0].user_state
                data['user_type'] = result[0].user_type
                data['mobile_phone'] = result[0].mobile_phone
                data['email'] = result[0].email
                data['reg_time'] = result[0].reg_time

                if (data[key]) {
                    return resolve({ code: 0, data: data[key] })
                }

                db.querySQL({
                    sql: "SELECT * FROM user_info WHERE uid = ?",
                    values: [uid],
                    timeout: 40000,
                }, function (err, result) {
                    if (err) {
                        return reject({ code: -1, msg: err })
                    }

                    data['nickname'] = result[0].nickname
                    data['stu_id'] = result[0].stu_id
                    data['realname'] = result[0].realname
                    data['verified'] = result[0].is_verified

                    if (key === '') {
                        delete data['password']
                        return resolve({ code: 0, data: data })
                    }
                    if (data[key]) {
                        return resolve({ code: 0, data: data[key] })
                    }
                    return resolve({ code: -1, msg: 'key不存在' })
                })
            })
        })
    },
    /**
     * 
     * @param {String} key 
     * @param {String} value 
     * @returns 
     */
    getUid: (key, value) => {
        return new Promise((resolve, reject) => {
            db.querySQL({
                sql: `SELECT uid FROM user WHERE ${key} = ?`,
                values: [value],
                timeout: 40000,
            }, function (err, result) {
                if (err) {
                    return reject({ code: -1, msg: err })
                }
                if (result.length == 0) {
                    return resolve({ code: -2, msg: '无结果' })
                }
                return resolve({ code: 0, data: result[0].uid })
            })
        })
    },
    set: (uid, table, key, value) => {
        return new Promise((resolve, reject) => {
            let data = {
                uid: uid
            }
            db.querySQL({
                sql: "SELECT * FROM user WHERE uid = ?",
                values: [uid],
                timeout: 40000,
            }, function (err, result) {
                if (err) {
                    return reject({ code: -1, msg: err })
                }
                if (result.length == 0) {
                    return resolve({ code: -2, msg: 'uid不存在' })
                }

                db.querySQL({
                    sql: `UPDATE ${table} SET ? = ? WHERE uid = ?`,
                    values: [key, value, uid],
                    timeout: 40000,
                }, function (err, result) {
                    if (err) {
                        return reject({ code: -1, msg: err })
                    }
                    return resolve({ code: 0, data: null })
                })
            })
        })
    },
    get: (table, key, value) => {
        return new Promise((resolve, reject) => {
            db.querySQL({
                sql: `SELECT * FROM ${table} WHERE ? = ?`,
                values: [key, value],
                timeout: 40000,
            }, function (err, result) {
                if (err) {
                    return reject({ code: -1, msg: err })
                }
                if (result.length == 0) {
                    return resolve({ code: -2, msg: '无结果' })
                }
                return resolve({ code: 0, msg: 'ok', data: result })
            })
        })
    },
    add: (data) => {
        return new Promise((resolve, reject) => {
            let user = {
                username: data.username,
                password: data.password,
                openid: data.openid || null,
                email: data.email || null,
                mobile_phone: data.mobile_phone || null,
                user_type: data.user_type || 1,
                reg_time: data.reg_time || new Date(),
                nickname: data.nickname || username,
                stu_id: data.stu_id || null,
                realname: data.realname,
            }
            if (user.stu_id) {
                user['stu_id_modify_time'] = data.stu_id_modify_time || new Date()
            } else {
                user['stu_id_modify_time'] = null
            }

            db.querySQL({
                sql: 'INSERT INTO user (uid, username, password, openid, user_state, email, is_email_verified, mobile_phone, is_phone_verified, user_type, reg_time, modified_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                values: [null, user.username, user.password, user.openid, 0, user.email, 0, user.mobile_phone, 0, user.user_type, user.reg_time, user.reg_time],
                timeout: 40000,
            }, function (err, result) {
                if (err) {
                    return reject({ code: -1, msg: err })
                }

                db.querySQL({
                    sql: 'SELECT uid FROM user WHERE username = ?;',
                    values: [user.username],
                    timeout: 40000,
                }, function (err, result) {
                    if (err) {
                        return reject({ code: -1, msg: err })
                    }

                    user['uid'] = result[0].uid

                    db.querySQL({
                        sql: 'INSERT INTO user_info (user_info_id, uid, nickname, stu_id, stu_id_modify_time, realname, is_info_verified, modified_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
                        values: [null, user.uid, user.nickname, user.stu_id, user.stu_id_modify_time, user.realname, 0, user.reg_time],
                        timeout: 40000,
                    }, function (err, result) {
                        if (err) {
                            return reject({ code: -1, msg: err })
                        }
                        return resolve({ code: 0, data: null })
                    })
                })
            })
        })
    }
}

module.exports = User
