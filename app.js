var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');// 导入模板子路由
var usersRouter = require('./routes/users');// 导入用户子路由
var articlesRouter = require('./routes/articles');// 导入文章子路由

var db = require('./db/connect');
// 配置favicon
var favicon = require('serve-favicon');

var app = express();

// favicon配置
app.use(favicon(path.join(__dirname,'public','favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// 使用body-parser中间件,就可以使用req.body解析post请求主体
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 使用cookie-parser中间件，就可以解析cookie
app.use(cookieParser());


// 配置服务端session
app.use(session({
  secret:'sz2009html5',
  resave:false,
  saveUninitialized:true,
  cookie:{
    maxAge:1000*60*60 // 指定session的有效时长,单位是毫秒值
  }
}))
// 配置静态路由
app.use(express.static(path.join(__dirname, 'public')));

app.get("*",(req,res,next)=>{
  let {username} = req.session; // 获取用户名
  let url = req.path;
  if(url!='/login'&&url!='/regist'){
    if(!username){
      res.redirect('/login')
    }else{
      next();
    }
  }else{
    next();
  }
})
// 配置子路由
// 配置模板路由
app.use('/', indexRouter);
// 配置用户子路由
app.use('/users', usersRouter);
// 配置文章子路由
app.use('/articles',articlesRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
