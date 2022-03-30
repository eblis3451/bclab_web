const userModel = require('../lib/mysql.js');
const md5 = require('md5')
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin
const moment = require('moment');
const fs = require('fs')

exports.getSignup = async ctx => {
    await checkNotLogin(ctx)
    await ctx.render('signup', {
        session: ctx.session,
    })
}
exports.postSignup = async ctx => {
    let { name, password, repeatpass, avator } = ctx.request.body
    console.log(typeof password)
    await userModel.findDataCountByName(name)
        .then(async (result) => {
            console.log(result)
            if (result[0].count >= 1) {
                // 用户存在
                ctx.body = {
                    code: 500,
                    message: '用户存在'
                };
            } else if (password !== repeatpass || password.trim() === '') {
                ctx.body = {
                    code: 500,
                    message: '兩次輸入的密碼不一致'
                };
            } else if(avator && avator.trim() === ''){
                ctx.body = {
                    code: 500,
                    message: '請上傳頭像'
                };
            } else {
                let base64Data = avator.replace(/^data:image\/\w+;base64,/, ""),
                    dataBuffer = new Buffer(base64Data, 'base64'),
                    getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now(),
                    upload = await new Promise((reslove, reject) => {
                        fs.writeFile('./public/images/' + getName + '.png', dataBuffer, err => {
                            if (err) {
                                throw err;
                                reject(false)
                            };
                            reslove(true)
                            console.log('頭像上傳成功')
                        });
                    });
                // console.log('upload', upload)
                if (upload) {
                    await userModel.insertData([name, md5(password), getName + '.png', moment().format('YYYY-MM-DD HH:mm:ss')])
                        .then(res => {
                            console.log('注刪成功', res)
                            //注册成功
                            ctx.body = {
                                code: 200,
                                message: '注刪成功'
                            };
                        })
                } else {
                    console.log('頭像上傳失敗')
                    ctx.body = {
                        code: 500,
                        message: '頭像上傳失敗'
                    }
                }
            }
        })
}