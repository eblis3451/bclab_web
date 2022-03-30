const router = require('koa-router')();               // 引入koa路由器框架
const controller = require('../controller/posts-ctl') // 引入我們新增的注冊控制器(控制它到那條路上)

// 重置到文章頁
router.get('/', controller.getRedirectPosts)
// 文章頁
router.get('/posts', controller.getPosts)
// 首頁分頁，每次輸出10條
router.post('/posts/page', controller.postPostsPage)
// 個人文章分頁，每次輸出10條
router.post('/posts/self/page', controller.postSelfPage)
// 單篇文章頁
router.get('/posts/:postId', controller.getSinglePosts)
// 發表文章頁面
router.get('/create', controller.getCreate)
// post 發表文章
router.post('/create', controller.postCreate)
// 發表評論
router.post('/:postId',controller.postComment)
// 編輯單篇文章頁面
router.get('/posts/:postId/edit', controller.getEditPage)
// post 編輯單篇文章
router.post('/posts/:postId/edit', controller.postEditPage)
// 刪除單篇文章
router.post('/posts/:postId/remove', controller.postDeletePost)
// 刪除評論
router.post('/posts/:postId/comment/:commentId/remove', controller.postDeleteComment)
// 評論分頁
router.post('/posts/:postId/commentPage', controller.postCommentPage)

module.exports = router