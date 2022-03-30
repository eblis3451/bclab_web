var mysql = require('mysql');
var config = require('../config/default.js')

var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE,
  port     : config.database.PORT
});

let query = ( sql, values ) => {

  // 返回一個異步操作(內含操作的事件處理)
  return new Promise(( resolve, reject ) => {
    // 使用連接
    pool.getConnection( (err, connection) => {
      if (err) {
        reject( err )
      } else {
        // 使用連接執行查詢
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          // 連接不再使用，返回到連接池
          connection.release()
        })
      }
    })
  })

}

// 建立用戶資料表
let users =
    `create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名',
     pass VARCHAR(100) NOT NULL COMMENT '密碼',
     avator VARCHAR(100) NOT NULL COMMENT '頭像',
     moment VARCHAR(100) NOT NULL COMMENT '注冊時間',
     PRIMARY KEY ( id )
    );`

    // 建立文章資料表
let posts =
    `create table if not exists posts(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '文章作者',
     title TEXT(0) NOT NULL COMMENT '評論題目',
     content TEXT(0) NOT NULL COMMENT '評論内容',
     md TEXT(0) NOT NULL COMMENT 'markdown',
     uid VARCHAR(40) NOT NULL COMMENT '用户id',
     moment VARCHAR(100) NOT NULL COMMENT '發表時間',
     comments VARCHAR(200) NOT NULL DEFAULT '0' COMMENT '文章評論數',
     pv VARCHAR(40) NOT NULL DEFAULT '0' COMMENT '瀏覽量',
     avator VARCHAR(100) NOT NULL COMMENT '用户頭像',
     PRIMARY KEY(id)
    );`

let comment =
    `create table if not exists comment(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名稱',
     content TEXT(0) NOT NULL COMMENT '評論内容',
     moment VARCHAR(40) NOT NULL COMMENT '評論時間',
     postid VARCHAR(40) NOT NULL COMMENT '文章id',
     avator VARCHAR(100) NOT NULL COMMENT '用户頭像',
     PRIMARY KEY(id) 
    );`

let createTable = ( sql ) => {
  return query( sql, [] )
}

// 建表
createTable(users)
createTable(posts)
createTable(comment)

// 注册用户
exports.insertData = ( value ) => {
  let _sql = "insert into users set name=?,pass=?,avator=?,moment=?;"
  return query( _sql, value )
}
// 删除用户
exports.deleteUserData = ( name ) => {
  let _sql = `delete from users where name="${name}";`
  return query( _sql )
}
// 查找用户
exports.findUserData = ( name ) => {
  let _sql = `select * from users where name="${name}";`
  return query( _sql )
}
// 發表文章
exports.insertPost = ( value ) => {
  let _sql = "insert into posts set name=?,title=?,content=?,md=?,uid=?,moment=?,avator=?;"
  return query( _sql, value )
}
// 增加文章評論數
exports.addPostCommentCount = ( value ) => {
  let _sql = "update posts set comments = comments + 1 where id=?"
  return query( _sql, value )
}
// 減少文章評論數
exports.reducePostCommentCount = ( value ) => {
  let _sql = "update posts set comments = comments - 1 where id=?"
  return query( _sql, value )
}

// 更新瀏覽數
exports.updatePostPv = ( value ) => {
  let _sql = "update posts set pv= pv + 1 where id=?"
  return query( _sql, value )
}

// 發表評論
exports.insertComment = ( value ) => {
  let _sql = "insert into comment set name=?,content=?,moment=?,postid=?,avator=?;"
  return query( _sql, value )
}
// 通過名字查找用户
exports.findDataByName =  ( name ) => {
  let _sql = `select * from users where name="${name}";`
  return query( _sql)
}
// 通過名字查找用户數量判斷是否已經存在
exports.findDataCountByName =  ( name ) => {
  let _sql = `select count(*) as count from users where name="${name}";`
  return query( _sql)
}
// 通過文章的名字查找用户
exports.findDataByUser =  ( name ) => {
  let _sql = `select * from posts where name="${name}";`
  return query( _sql)
}
// 通過文章id查找
exports.findDataById =  ( id ) => {
  let _sql = `select * from posts where id="${id}";`
  return query( _sql)
}
// 通過文章id查找
exports.findCommentById =  ( id ) => {
  let _sql = `select * from comment where postid="${id}";`
  return query( _sql)
}

// 通過文章id查找評論數
exports.findCommentCountById =  ( id ) => {
  let _sql = `select count(*) as count from comment where postid="${id}";`
  return query( _sql)
}

// 通過評論id查找
exports.findComment = ( id ) => {
  let _sql = `select * from comment where id="${id}";`
  return query( _sql)
}
// 查詢所有文章
exports.findAllPost = () => {
  let _sql = `select * from posts;`
  return query( _sql)
}
// 查詢所有文章數量
exports.findAllPostCount = () => {
  let _sql = `select count(*) as count from posts;`
  return query( _sql)
}
// 查詢分頁文章
exports.findPostByPage = ( page ) => {
  let _sql = ` select * from posts limit ${(page-1)*10},10;`
  return query( _sql)
}
// 查詢所有個人用户文章數量
exports.findPostCountByName = (name) => {
  let _sql = `select count(*) as count from posts where name="${name}";`
  return query( _sql)
}
// 查詢个人分頁文章
exports.findPostByUserPage = (name,page) => {
  let _sql = ` select * from posts where name="${name}" order by id desc limit ${(page-1)*10},10 ;`
  return query( _sql)
}
// 更新修改文章
exports.updatePost = (values) => {
  let _sql = `update posts set title=?,content=?,md=? where id=?`
  return query(_sql,values)
}
// 刪除文章
exports.deletePost = (id) => {
  let _sql = `delete from posts where id = ${id}`
  return query(_sql)
}
// 刪除評論
exports.deleteComment = (id) => {
  let _sql = `delete from comment where id=${id}`
  return query(_sql)
}
// 刪除所有評論
exports.deleteAllPostComment = (id) => {
  let _sql = `delete from comment where postid=${id}`
  return query(_sql)
}

// 滾動無限加載數據
exports.findPageById = (page) => {
  let _sql = `select * from posts limit ${(page-1)*5},5;`
  return query(_sql)
}
// 評論分頁
exports.findCommentByPage = (page,postId) => {
  let _sql = `select * from comment where postid=${postId} order by id desc limit ${(page-1)*10},10;`
  return query(_sql)
}



