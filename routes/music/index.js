const express = require('express');
const router = express.Router();
const { sendJSON } = require('../utils/index')

router.get('/', function (req, res, next) {
    sendJSON(res, 0, '音乐平台API正常运行中', {available: ['ncm', 'qq']});
});

module.exports = router