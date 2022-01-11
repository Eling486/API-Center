const express = require('express');
const router = express.Router();
const fs = require('fs')
const path = require('path')
const { sendJSON, ipTrans} = require('./utils/index')
const orm = require('../db/orm/index')

router.get('/', async function (req, res, next) {
  sendJSON(res, 0, 'APICenter正常运行中');
});

router.get('/test', async function(req, res, next){
  let data = '192.108.1.1'
  sendJSON(res, 0, ipTrans(data))
})
module.exports = router;
