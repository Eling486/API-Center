var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.json({ code: 0, message: '管理后台API正常运行中' });
});

router.get('/:apiName', function (req, res, next) {
    res.send(req.params)
})

module.exports = router