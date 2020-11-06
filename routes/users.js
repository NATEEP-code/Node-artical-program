var express = require('express');
let usersModel = require('../db/userModel')
var router = express.Router();
var bcrypt = require('bcrypt');
/* 
注册接口
    业务接口说明:注册业务
    请求方式：post
    入参：username，password，password2
    返回值:重定向，注册成功重定向到/login，失败重定向到/regist
*/
router.post('/regist',(req,res,next)=>{
  let{username,password,password2} = req.body;//因为安装了body-parser
  password = bcrypt.hashSync(password,10);//把密码进行加密，再存入数据库
  usersModel.find({username}).then(docs=>{
    if(docs.length>0){
      // res.send('用户已存在')
      res.redirect('/regist')
    }else{
      let creatTime = Date.now();
      usersModel.insertMany({
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
  usersModel.find({username}).then(docs=>{
    if(docs.length>0){
      var result = bcrypt.compareSync(password,docs[0].password)
      if(result){
        req.session.username = username;
        req.session.islogin = true;
        res.redirect('/')
      }else{
        // 密码错误
        res.redirect('/login')
      }
    }else{
    // res.send('用户名不存在')
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
