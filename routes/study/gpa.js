const express = require('express');
const router = express.Router();
const { sendJSON } = require('../utils/index')

const GRADE = {
    "A+": 4.3,
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "F": 0.0,
}

/**
 * POST 计算GPA及WGPA
 * /study/gpa?type=<type>
 * type(可选)：gpa(默认), wgpa
 */
router.post('/', function (req, res, next) {
    try {
        let type = req.query.type || 'gpa'
        type.toLowerCase()
        let data = req.body.data
        data = JSON.parse(data)
        let gpa = 0
        let wgpa = 0
        let credit = 0
        let w_credit = 0
        data.forEach(e => {
            if (!e.level && type == 'wgpa') {
                throw {code: -502, msg: "请给出每门课程的难度(Level)"}
            }
            if (!GRADE[e.grade]) {
                throw {code: -502, msg: "课程的等级(Grade)不合法"}
            }
            gpa += e.credit * GRADE[e.grade]
            credit += e.credit
            if (type == 'wgpa') {
                wgpa += e.credit * GRADE[e.grade] * e.level
                w_credit += e.credit * e.level
            }
        });
        gpa = gpa / credit
        gpa = gpa.toFixed(2)
        let result = {
            gpa: gpa
        }
        if (type == 'wgpa') {
            wgpa = wgpa / w_credit
            wgpa = wgpa.toFixed(2)
            result['wgpa'] = wgpa
        }
        return sendJSON(res, 0, 'ok', result)
    } catch (e) {
        if(e.code){
            return sendJSON(res, -502, e)
        }
        return sendJSON(res, -502, "API调用失败")
    }
});

module.exports = router;
