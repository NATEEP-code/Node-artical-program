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
        console.log(req.session);
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
            var write = fs.createWriteStream(path.join(__dirname,'..','public/images/',file.originalFilename))
            // 管道流，图片写入指定目录
            read.pipe(write);
            write.on('close',function(){
                console.log('图片上传成功');
                res.send({
                    err:0,
                    msg:'/images/'+file.originalFilename
                })
            })
        }
    })
})

module.exports = router;