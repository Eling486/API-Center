const express = require('express');
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const FileStreamRotator = require('file-stream-rotator')
const session = require("express-session")
const FileStore = require('session-file-store')(session);

const app = express();

/*
app.use((req, res, next) => {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    })
  }
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})*/

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "aapplication/json; charset=utf-8");
  next();
});

// 日志文件输出
const LOG_DIR = path.join(__dirname, 'log')
const CACHE_DIR = path.join(__dirname, 'cache')
fs.existsSync(CACHE_DIR) || fs.mkdirSync(CACHE_DIR)

if(!fs.existsSync(LOG_DIR)){
  fs.mkdirSync(LOG_DIR)
  fs.mkdirSync(path.join(LOG_DIR, 'succeed'))
  fs.mkdirSync(path.join(LOG_DIR, 'error'))
}

var succeedLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(LOG_DIR, 'succeed', '%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

var errorLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(LOG_DIR, 'error', '%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

function isSucceed(status){
  let code = parseInt(status)
  if(code >= 200 && code < 400){
    return true
  }
  return false
}

app.use(logger('dev'))

app.use(logger(function (tokens, req, res) {
  let status = tokens.status(req, res)
  if (isSucceed(status)) {
    return [
      `[${tokens.date(req, res)}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      `HTTP/${tokens['http-version'](req, res)}`,
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      `${tokens['response-time'](req, res)}ms`,
      tokens.referrer(req, res),
      tokens['user-agent'](req, res)
    ].join(' ')
  }
}, { stream: succeedLogStream }))

app.use(logger(function (tokens, req, res) {
  let status = tokens.status(req, res)
  if (!isSucceed(status)) {
    return [
      `[${tokens.date(req, res)}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      `HTTP/${tokens['http-version'](req, res)}`,
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      `${tokens['response-time'](req, res)}ms`,
      tokens.referrer(req, res),
      tokens['user-agent'](req, res)
    ].join(' ')
  }
}, { stream: errorLogStream }))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'api-center',
  secret: 'api-center',
  store: new FileStore(),
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 30  // 有效期，单位是毫秒
  }
}));




/**
 * 自动生成路由
 * @param {*} dir 路由文件根目录
 * @param {*} routerList 路由列表
 * @returns routerList 路由列表
 */
function autoRouter(dir, routerList = {}) {
  let files = fs.readdirSync(dir);
  if (files !== []) {
    files.forEach((item, index) => {
      let fullPath = path.join(dir, item);
      let stat = fs.statSync(fullPath);
      let ext = path.extname(item)
      if (stat.isDirectory()) {
        if (item !== 'utils' && item !== 'modules') {
          autoRouter(path.join(dir, item), routerList);
        }
      } else {
        if (ext == '.js') {
          let router, router_path
          if (item == 'index.js') {
            router = dir.replace(/routes/g, "").replace(/\\/g, "/");
            router_path = './' + path.join(dir, item)
          } else {
            router = path.join(dir, item).replace(/routes/g, "").replace(/\\/g, "/").replace(/.js/g, '');
            router_path = './' + path.join(dir, item)
          }
          if (router == './') {
            router = '/'
            router_path = './routes/index'
          }
          routerList[router] = router_path;
        }
      }
    })
  }
  return routerList
}
/**
 * 根据Json文件生成路由
 * @param {*} file 存放路由信息的json文件
 * @param {*} routerList 路由列表
 * @returns routerList 路由列表
 */
function json2Router(file, routerList = {}) {
  let json = fs.readFileSync(file);
  json = JSON.parse(json).routes

  function readJSON(json, base_path, key = "") {
    for (item in json) {
      if (typeof json[item] == "object") {
        readJSON(json[item], path.join(base_path, item), item)
      } else {
        if (item == "active") {
          if (json.active == true) {
            let router = base_path
            let router_path = path.join("./routes", base_path)
            if (key == "/" && base_path.length > 1) {
              router = base_path.substr(0, base_path.length - 1)
              router_path = path.join(router_path, "index")
            }
            if (json.path && json.path !== []) {
              router_path = path.join("./routes", base_path.substr(0, base_path.length - key.length), json.path)
            }
            router = router.split(path.sep).join('/')
            router_path = `./${router_path}.js`.split(path.sep).join('/')
            if (fs.existsSync(router_path)) {
              routerList[router] = router_path
            } else {
              console.warn(`Cannot find path '${router_path}'!`)
            }
          }
        }
      }
    }
  }

  readJSON(json, "/")
  return routerList
}

// let routerList = autoRouter('./routes')
let routerList = json2Router('./routes/routes.json')
// console.log(routerList)

for (let key in routerList) {
  let addRouter = require(`${routerList[key]}`);
  console.log(key)
  app.use(key, addRouter);
}

module.exports = app;
