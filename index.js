const Koa = require('koa');  // Web 框架
const path = require('path')  // 路徑處理模組
const bodyParser = require('koa-bodyparser'); // 內容解析處理模組 
const ejs = require('ejs');  // 網頁模版框架
const session = require('koa-session-minimal');  // 提供session存儲介質的讀寫接口
const MysqlStore = require('koa-mysql-session');  // 提供mysql介質的讀寫接口
const config = require('./config/default.js');
const router = require('koa-router')  // 實現路由的模組
const views = require('koa-views')    // 處理web頁面的模組
// const koaStatic = require('koa-static')
const staticCache = require('koa-static-cache')  // 處理靜態資源的模組(中間件)
const app = new Koa()


// session 存儲配置
const sessionMysqlConfig= {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST,
  port: config.database.PORT,
}

// 配置 session 中間件
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore(sessionMysqlConfig)
}))


// 配置靜態資源加載中間件
// app.use(koaStatic(
//   path.join(__dirname , './public')
// ))
// 緩存
app.use(staticCache(path.join(__dirname, './public'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))

// 配置服務端模板染引擎中間件
app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs'
}))
app.use(bodyParser({
  formLimit: '1mb'
}))

//  路由
app.use(require('./routers/signin.js').routes())
app.use(require('./routers/signup.js').routes())
app.use(require('./routers/posts.js').routes())
app.use(require('./routers/signout.js').routes())


app.listen(config.port)

console.log(`listening on port ${config.port}`)