const express = require('express');
const router = express.Router();
const fs = require('fs')
const path = require('path')
var multer = require("multer");
const crypto = require('crypto');
const { sendJSON } = require('../utils/index')
const { encrypt } = require('../../utils/index')

const back_end_server = 'http://localhost:8000'

var upload = multer({ dest: './cache' });
router.post('/', upload.single('file'), function (req, res) {

    // TODO: 添加鉴权

    let file = fs.readFileSync(req.file.path);

    const md5 = encrypt.md5(file)

    let ext = ''
    console.log(req.file.mimetype)
    if(req.file.mimetype == 'image/jpeg'){
        ext = '.jpg'
    }else if(req.file.mimetype == 'image/png'){
        ext = '.png'
    }else if(req.file.mimetype == 'image/gif'){
        ext = '.gif'
    }else{
        return sendJSON(res, -1, `不支持该文件类型`);
    }

    let filepath = `./public/img/upload/${md5}${ext}`
    fs.writeFile(filepath, file, function (err) {
        if (err) {
            throw err;
        }
        fs.unlink(req.file.path, function (err) {
            if (err) {
                throw err;
            }
            return sendJSON(res, 0, `ok`,{
                url: `${back_end_server}/img/upload/${md5}${ext}`
            });
        })
    });
});
module.exports = router;
