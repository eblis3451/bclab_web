const router = require('koa-router')();　　　　　　　　　  // 引入koa路由器框架
const controller = require('../controller/signup-ctl')  // 引入我們新增的注冊控制器(控制它到那條路上)

// 注冊頁面
router.get('/signup', controller.getSignup)
// post 注冊
router.post('/signup', controller.postSignup)

module.exports = router