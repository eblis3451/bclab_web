const router = require('koa-router')();                // 引入koa路由器框架
const controller = require('../controller/signin-ctl') // 引入我們新增的注冊控制器(控制它到那條路上)

router.get('/signin', controller.getSignin)
router.post('/signin', controller.postSignin)

module.exports = router