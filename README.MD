## 1 使用Express-generator初始化项目
```
npm i express-generator -g
express --view=ejs EM-practice //--view=ejs指定模板引擎是ejs
cd EM-Practice
npm i 
npm start //nodemon ./bin/www
```

## 2 详解express-generator脚手架搭建的项目架构
+ package.json:项目信息的描述文件
    + script属性里面可以配置npm的快捷指令
        + npm run 命令名称
    + cookie-parser:用于解析cookie会话数据
    + morgen:是一个日志工具
    + serve-favicon：用于设置网站的favicon
        + npm i serve-favicon -S
    + body-parser用于解析http请求体中的body数据
        + req.query 只能解析http请求体中的body数据
        + req.body 能解析post请求主题的信息
    + express-session:在服务端记录用户的简单信息
        + npm i express-session -S
## 3 数据库集合结构
+ 在项目根目录里面新建db文件夹
    + npm i mongoose -S
    + 用于存放数据库连接和集合结构
    + connect.js:数据库链接文件
    + userModel.js:用户集合文件
    + articleModel.js:文章集合文件

> connect.js
```javascript
// 引入模块
const mongoose = require ('mongoose')
// 连接数据库
mongoose.connect('mongodb://localhost/project',{})

var db = mongoose.connection;

db.on('error',function(){
    console.log("数据库连接错误");
})
db.once('open',function(){
    console.log('数据库连接成功');
})
```
>userModel.js
```javascript
//引入模块
const mongoose = require('mongoose');
let userSchema = mongoose.Schema({
    username:String,
    password:String,
    creatTime:Number
})

let userModel = mongoose.model('users',userSchema)

module.exports = userModel;
```
>articeModel.js
```javascript
const mongoose = require('mongoose');
let articleSchema = mongoose.Schema({
    title:String,
    content:String,
    creatTime:Number,
    username:String
})

let articleModel = mongoosoe.model('articles',articleSchema)

module.exports = articleModel;

```
## 4 public目录和views目录结构改造
+ public
    + 包含stylesheets,images,javascripts等静态资源
+ views
    + 所有html文件放入(除了error.html以外)
    + 后缀名改为ejs
    + 提取相同部分,体用include引入
        + <%-include%>
    + 改造css,js,img的链接地址，以public为根目录


## 5 路由说明
路由|功能|请求方式|入参|返回值|说明
:-|:-|:-|:-|:-|:-
/|编译index.ejs模板|get|page,size|返回index|页面|无
/regist|编译regist.ejs模板|get|无|返回regist页面|无
/login|编译login.ejs模板|get|无|返回login页面|无
/write|编译write.ejs模板|get|无|返回write页面|登陆后访问，有id是编辑页，无id是新增页
/detail|编译detail.ejs模板|get|id|返回detail页面|无
/users/regist|注册业务|post|username,password,password2|重定向|注册成功重定向到/login，失败重定向到/regist
/users/login|登陆业务|post|username，password|重定向|登陆成功重定向到/，失败冲顶次昂到/login
/users/logout|退出登陆业务|get|无|重定向|退出登录后重定向到/login
/articles/write|文章修改和新增业务|post|title，content，username，id|重定向|有id是修改业务，无id是新增业务，成功重定向/，失败重定向/write
/articles/delete|文章删除业务|get|id|重定向|失败成功都重定向到/
/articles/upload|文件上传业务|post|file|json|{err:0,mes:'图片路径'}

## 6 app.js
```js
const session = require('express-session');
// 配置服务器session
app.use(session({
    secret:'sz2009html5',
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60 // 指定session的有效时长,单位是毫秒值
    }
}))

//连接数据库
var db = require('../db/connect');
```
## 7 模板子路由器
> routes/index.js

```js
var express = require('express');
var router = express.Router();

// 首页路由
router.get('/',(req,res,next)=>{
  res.render('index',{})
})

// 注册页路由
router.get('/regist',(req,res,next)=>{
  res.render('regist',{})
})

// 登录页路由
router.get('/login',(req,res,next)=>{
  res.render('login',{})
})

// 撰写耶路由
router.get('/write',(req,res,next)=>{
  res.render('write',{})
})

// 详情页路由
router.get('/detail',(req,res,next)=>{
  res.render('detail',{})
})

module.exports = router;

```
## 8 用户子路由
>routes/users.js
```js
var express = require('express');
let usersModel = require('../db/userModel')
var router = express.Router();

/* 
注册接口
    业务接口说明:注册业务
    请求方式：post
    入参：username，password，password2
    返回值:重定向，注册成功重定向到/login，失败重定向到/regist
*/
router.post('/regist',(req,res,next)=>{
  let{username,password,password2} = req.body;//因为安装了body-parser
  usersModel.find({username}).then(docs=>{
    if(docs.length>0){
      // res.send('用户已存在')
      res.redirect('/regist')
    }else{
      let creatTime = Date.now();
      userModel.insertMany({
        username,
        password,
        creatTime
      }).then(docs=>{
        // res.send('注册成功')
        res.redirect('/login')
      }).catch(err=>{
        // res.send('注册失败')
        res.redirect('/regist')
      })
    }
  })
})

/* 
登录接口
    业务接口说明:登陆业务
    请求方式：post
    入参：username，password
    返回值:重定向，注册成功重定向到/，失败重定向到/login
*/
router.post('/login',(req,res,next)=>{
  let{username,password} = req.body;//因为安装了body-parser
  usersModel.find({username,password}).then(docs=>{
    if(docs.length>0){
      // res.send('登陆成功')
      req.session.username = username;
      req.session.islogin = true;
      res.redirect('/')
    }else{
    // res.send('用户名或密码错误')
     res.redirect('/login')
    }
  }).catch(function(){
    // res.send('登陆失败')
    res.redirect('/login')
  })
})

/* 
退出登录接口
    +业务接口说明:退出登录业务
    请求方式:get
    入参：无
    返回值:重定向到/login
*/
router.get('/logout',(req,res,next)=>{
  req.session.username = null;
  req.session.islogin = false;
  // res.send('退出登陆成功')
  res.redirect('/login')
})

module.exports = router;
```
> 注意:
+ 在这里把用户子路由完成以后，更新模板里面的用户业务链接
    + bar.ejs里面 <a href="/users/logout">退出</a>
+ 更新app.js里面关于用户子路由的配置，添加代码如下
```js
    var usersRouter = require('./routes/users');//导入用户子路由
    app.use('/users',usersRouter);// 配置用户子路由
```

## 9 文章子路由
>routes/articles.js
```js
var express = require('express');
let articleModel = require('../db/articleModel');
var router = express.Router();
const fs = require('fs')
const path = require('path')
var multiparty = require('multiparty');// 处理文件上传

/* 
    文章撰写接口
        业务接口说明:文章修改和新增业务，登录后才能访问
        请求方式:post请求
        入参:title,content,username,id
        返回值:重定向,有id是修改业务,有id是新增业务，成功重定向/，失败重定向/write
*/
router.post('/write',(req,res,next)=>{
    let {title,content,username,id} = req.body;
    let creatTime = Date.now()
    if(id){
        id = new Object(id);
        articleModel.updateOne({_id:id},{
            title,content,username,creatTime
        }).then(data=>{
            res.redirect('/')
            // res.send(data)
        }).catch(err=>{
            // res.send('文章修改失败')
            res.redirect('/write')
        })
    }else{
        let username = req.session.username;
        articleModel.insertMany({
            username,
            title,
            content,
            creatTime
        }).then(data=>{
            // res.send('文章写入成功')
            res.redirect('/')
        }).catch(err=>{
            // res.send('文章写入失败')
            res.redirect('/write')
        })
    }
})

/* 
文章删除接口
    业务接口说明:文章删除业务
    请求方式:get请求
    入参:id
    返回值:失败成功都重定向到/
*/
router.get('/delete',(req,res,next)=>{
    let id = req.query.id;
    id = new Object(id);
    // 删除
    articleModel.deleteOne({_id:id}).then(data=>{
        // res.send('文章删除成功')
        res.redirect('/')
    })
    .catch(err=>{
        res.send('文章删除失败')
        res.redirect('/')
    })
})

/* 
图片上传接口
    业务接口说明:图片上传业务
    请求方式:post请求
    入参:file,使用的富文本编辑插件xheditor里面上次图片的文件有的name是filedata
    返回值:json格式,例如：{err:0,mes:'图片路径'}
*/
router.post('/upload',(req,res,next)=>{
    // 每次访问该接口，都新建一个form对象来解析文件数据
    var form = new multiparty.Form();
    form.parse(req,(err,field,files)=>{
        if(err){
            console.log('文件上传成功');
        }else{
            // console.log('----field----');
            // console.log(field);
            // console.log('------files------');
            // console.log(files.filedata);
            var file = files.filedata[0];
            var read = fs.createReadStream(file.path);
            var write = fs.createWriteStream(path.join(__dirname,'..','public/images',file.originalFilename))
            // 管道流，图片写入指定目录
            read.pipe(write);
            write.on('close',function(){
                console.log('图片上传成功');
                res.send({
                    err:0,
                    msg:'/images'+file.originalFilename
                })
            })
        }
    })
})

module.exports = router;
```
> 注意：
+ 在文章路由里面需要接受表单上传的文件,body-parser不擅长，我们使用multiparty模块
    + npm i multiparty
+ 在这里把文章子路由完成以后，根棍模板里面的文章业务逻辑
    + index.ejs里面 <a href="/articles/delete">删除</a>
+ 更新app.js里面关于文章子路由配置，添加代码如下
```js
    var articlesRouter = require('./routes/articles');// 导入文章子路由
    app.use('/articles',articlesRouter);// 配置文章子路由
```

## 10 使用Postman测试所有接口

## 11 模板子路由-首页路由(/)
```js

```
