var express = require('express');
var router = express.Router();
var articlesModel = require('../db/articleModel');
var moment = require('moment');
// 首页路由
router.get('/',(req,res,next)=>{
  let page = parseInt(req.query.page||1);
  let size = parseInt(req.query.size||3);
  let username = req.session.username;

  articlesModel.find().count().then(total=>{
    var pages = Math.ceil(total/size);
    articlesModel.find().sort({'creatTime':-1}).skip((page-1)*size).limit(size)
    .then(docs=>{
      var arr = docs.slice();
      for(let i = 0;i<arr.length;i++){
        arr[i].creatTimeZH = moment(arr[i].creatTime).format('YYYY-MM-DD HH:mm:ss')
      };
      res.render('index',{
        data:{
          list:arr,
          total:pages,
          username
        }
      })
    }).catch(err=>{
      res.redirect('/')
    })
  })

})

// 注册页路由
router.get('/regist',(req,res,next)=>{
  res.render('regist',{})
})

// 登录页路由
router.get('/login',(req,res,next)=>{
  res.render('login',{})
})

// 撰写页路由
router.get('/write',(req,res,next)=>{
  var id = req.query.id;
  if(id){
    console.log('编辑页进入成功');
    id = new Object(id);
    articlesModel.findById(id)
    .then(doc=>{
      console.log(doc);
      res.render('write',{doc,username:req.session.username})
    })
    .catch(err=>{
      res.redirect('/')
    })
  }else{
    console.log('写入页进入成功');
    var doc = {
      _id:'',
      username:req.session.username,
      title:'',
      content:''
    };
    res.render('write',{doc,username:req.session.username})
  }
})

// 详情页路由
router.get('/detail',(req,res,next)=>{
  var id = req.query.id;
  articlesModel.findById(id)
  .then(doc=>{
    doc.creatTimeZH = moment(doc.creatTime).format('YYYY-MM-DD HH:mm:ss');
    res.render('detail',{
      doc,username:req.session.username
    })
  })
  .catch(err=>{
    res.send(err)
  })
})

module.exports = router;
