
const userModel = require('../lib/mysql.js')
const moment = require('moment')
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin;
const md = require('markdown-it')();  
/**
 * 重置到文章頁
 */
exports.getRedirectPosts = async ctx => {
    ctx.redirect('/posts')
}
/**
 * 文章頁
 */
exports.getPosts = async ctx => {
    let res,
        postCount,
        name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
    if (ctx.request.querystring) {
        await userModel.findPostCountByName(name)
            .then(result => {
                postCount = result[0].count
            })
        await userModel.findPostByUserPage(name, 1)
            .then(result => {
                res = result
            })
        await ctx.render('selfPosts', {
            session: ctx.session,
            posts: res,
            postsPageLength: Math.ceil(postCount / 10),
        })
    } else {
        await userModel.findPostByPage(1)
            .then(result => {
                res = result
            })
        await userModel.findAllPostCount()
            .then(result => {
                postCount = result[0].count
            })
        await ctx.render('posts', {
            session: ctx.session,
            posts: res,
            postsLength: postCount,
            postsPageLength: Math.ceil(postCount / 10),

        })
    }
}
/**
 * 首頁分頁， 每次輸出10條
 */
exports.postPostsPage = async ctx => {
    let page = ctx.request.body.page;
    await userModel.findPostByPage(page)
        .then(result => {
            ctx.body = result
        }).catch(() => {
            ctx.body = 'error'
        })
}
/**
 * 個人文章分頁， 每次輸出10條
 */
exports.postSelfPage = async ctx => {
    let data = ctx.request.body
    await userModel.findPostByUserPage(decodeURIComponent(data.name), data.page)
        .then(result => {
            ctx.body = result
        }).catch(() => {
            ctx.body = 'error'
        })
}
/**
 * 單篇文章頁
 */
exports.getSinglePosts = async ctx => {
    let postId = ctx.params.postId,
        count,
        res,
        pageOne;
    await userModel.findDataById(postId)
        .then(result => {
            res = result
        })
    await userModel.updatePostPv(postId)
    await userModel.findCommentByPage(1, postId)
        .then(result => {
            pageOne = result
        })
    await userModel.findCommentCountById(postId)
        .then(result => {
            count = result[0].count
        })
    await ctx.render('sPost', {
        session: ctx.session,
        posts: res[0],
        commentLength: count,
        commentPageLength: Math.ceil(count / 10),
        pageOne: pageOne
    })

}
/**
 * 發表文章頁面
 */
exports.getCreate = async ctx => {
    await checkLogin(ctx)
    await ctx.render('create', {
        session: ctx.session,
    })
}
/**
 * 發表文章
 */
exports.postCreate = async ctx => {
    let {title,content} = ctx.request.body,
        id = ctx.session.id,
        name = ctx.session.user,
        time = moment().format('YYYY-MM-DD HH:mm:ss'),
        avator,
        // 現在使用markdown不需要單獨轉義(单独转义)
        newContent = content.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        }),
        newTitle = title.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        });

    await userModel.findUserData(ctx.session.user)
        .then(res => {
            avator = res[0]['avator']
        })
    await userModel.insertPost([name, newTitle, md.render(content), content, id, time, avator])
        .then(() => {
            ctx.body = {
                code:200,
                message:'發表文章成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '發表文章失敗'
            }
        })
}
/**
 * 发表评论
 */
exports.postComment = async ctx => {
    let name = ctx.session.user,
        content = ctx.request.body.content,
        postId = ctx.params.postId,
        time = moment().format('YYYY-MM-DD HH:mm:ss'),
        avator;
    await userModel.findUserData(ctx.session.user)
        .then(res => {
            avator = res[0]['avator']
        })
    await userModel.insertComment([name, md.render(content), time, postId, avator])
    await userModel.addPostCommentCount(postId)
        .then(() => {
            ctx.body = {
                code:200,
                message:'評論成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '評論失敗'
            }
        })
}
/**
 * 編輯單篇文章頁面
 */
exports.getEditPage = async ctx => {
    let name = ctx.session.user,
        postId = ctx.params.postId,
        res;
    await checkLogin(ctx)
    await userModel.findDataById(postId)
        .then(result => {
            res = result[0]
        })
    await ctx.render('edit', {
        session: ctx.session,
        postsContent: res.md,
        postsTitle: res.title
    })

}
/**
 * post 編輯單篇文章
 */
exports.postEditPage = async ctx => {
    let title = ctx.request.body.title,
        content = ctx.request.body.content,
        id = ctx.session.id,
        postId = ctx.params.postId,
        allowEdit = true,
        // 現在使用markdown不需要單獨轉義
        newTitle = title.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        }),
        newContent = content.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        });
    await userModel.findDataById(postId)
        .then(res => {
            if (res[0].name != ctx.session.user) {
                allowEdit = false
            } else {
                allowEdit = true
            }
        })
    if (allowEdit) {
        await userModel.updatePost([newTitle, md.render(content), content, postId])
            .then(() => {
                ctx.body = {
                    code: 200,
                    message: '編輯成功'
                }
            }).catch(() => {
                ctx.body = {
                    code: 500,
                    message: '編輯失敗'
                }
            })
    } else {
        ctx.body = {
            code: 404,
            message: '無權限'
        }
    }
}
/**
 * 刪除單篇文章
 */
exports.postDeletePost = async ctx => {
    let postId = ctx.params.postId,
        allow;
    await userModel.findDataById(postId)
        .then(res => {
            if (res[0].name != ctx.session.user) {
                allow = false
            } else {
                allow = true
            }
        })
    if (allow) {
        await userModel.deleteAllPostComment(postId)
        await userModel.deletePost(postId)
            .then(() => {
                ctx.body = {
                    code: 200,
                    message: '刪除文章成功'
                }
            }).catch(() => {
                ctx.body = {
                    code: 500,
                    message: '刪除文章失敗'
                }
            })
    } else {
        ctx.body = {
            code: 404,
            message: '無權限'
        }
    }
}
/**
 * 刪除評論
 */
exports.postDeleteComment = async ctx => {
    let postId = ctx.params.postId,
        commentId = ctx.params.commentId,
        allow;
    await userModel.findComment(commentId)
        .then(res => {
            if (res[0].name != ctx.session.user) {
                allow = false
            } else {
                allow = true
            }
        })
    if (allow) {
        await userModel.reducePostCommentCount(postId)
        await userModel.deleteComment(commentId)
            .then(() => {
                ctx.body = {
                    code: 200,
                    message: '刪除評論成功'
                }
            }).catch(() => {
                ctx.body = {
                    code: 500,
                    message: '刪除評論失敗'
                }

            })
    } else {
        ctx.body = {
            code: 404,
            message: '無權限'
        }
    }
}
/**
 * 評論分頁
 */
exports.postCommentPage = async function (ctx) {
    let postId = ctx.params.postId,
        page = ctx.request.body.page;
    await userModel.findCommentByPage(page, postId)
        .then(res => {
            ctx.body = res
        }).catch(() => {
            ctx.body = 'error'
        })
}