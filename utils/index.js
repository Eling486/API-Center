const fs = require('fs')
const path = require('path')
const request = require('./request')
const crypto = require('crypto');

module.exports = {
    
    /**
     * 获取设备种类
     * @param {*} req 
     * @returns 
     */
    getMachine: (req) => {
        var deviceAgent = req.headers["user-agent"].toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|android)/);
        if (agentID) {
            return "mobile";
        } else {
            return "pc";
        }
    },

    /**
     * IP地址的字符串与整数格式互转
     * @param {*} data 
     * @returns 
     */
     ipTrans: (data) => {
        if (data.indexOf('.') < 0) {
            let num = Number(data)
            let ip = new Array();
            ip[0] = (num >>> 24) >>> 0;
            ip[1] = ((num << 8) >>> 24) >>> 0;
            ip[2] = (num << 16) >>> 24;
            ip[3] = (num << 24) >>> 24;
            console.log(ip)
            return ip.join('.')
        } else {
            let ip = data.split('.')
            if (ip.length !== 4) {
                return undefined
            }
            let result = Number(ip[0]) * Math.pow(256, 3) + Number(ip[1]) * Math.pow(256, 2) + Number(ip[2]) * 256 + Number(ip[3])
            return result >>> 0
        }
    },

    /**
     * 将数据中的所有null转换为空字符串
     * @param {*} data 
     * @returns 
     */
    nullToStr: (data) => {
        for (let x in data) {
            if (data[x] === null) { // 如果是null 把直接内容转为 ''
                data[x] = '';
            } else {
                if (Array.isArray(data[x])) { // 是数组遍历数组 递归继续处理
                    data[x] = data[x].map(z => {
                        return this.nullToStr(z);
                    });
                }
                if (typeof (data[x]) === 'object') { // 是json 递归继续处理
                    data[x] = this.nullToStr(data[x])
                }
            }
        }
        return data;
    },

    /**
     * 将Cookie字符串转换为JSON对象
     * @param {String} cookie 
     * @returns 
     */
    cookieToJSON(cookie) {
        if (!cookie) return {}
        let cookieArr = cookie.split(';')
        let obj = {}
        cookieArr.forEach((i) => {
            let arr = i.split('=')
            obj[arr[0]] = arr[1]
        })
        return obj
    },

    /**
     * 发起请求
     */
    request: request,

    /**
     * 常用加密
     */
     encrypt:{
        md5: (data) => {
            return crypto.createHash('md5').update(data).digest("hex")
        },
        sha256: (data) => {
            return crypto.createHash('sha256').update(data).digest("hex")
        }
    },
    
    /**
     * 微信相关API及参数
     */
    wxAPI:{
        appId: 'wx9ffe30afecbafd2a',
        appSecret: 'fafcea41b3d2ba40d09bb4d44e2e4245',
        code2session: function(code){
            return `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&grant_type=authorization_code&js_code=${code}`
        }
    },
}