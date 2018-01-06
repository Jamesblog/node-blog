/**
 * 页面入口文件
 */

const express = require('express');
// 引入模版文件
const swig = require('swig');
// 引入body-parse，处理传递过来的数据
const bodyParse = require('body-parser');
// user表
const User = require('./models/User');
const app = express();
// cookies
const Cookies = require('cookies');
// 加载数据库模块
const mongoose = require("mongoose");
// 设置静态文件托管，如果访问/pub，则转到public下找资源文件，并不解析为html
app.use('/public',express.static(`${__dirname}/public`));
// 设置模版引擎
app.engine('html',swig.renderFile);
// 设置模版文件存放目录 第一个参数固定为views
app.set('views','./view');
// 注册模版引擎，第一个参数固定为view engine
app.set('view engine','html');
// 在开发过程中取消模版的缓存
swig.setDefaults({cache: false});
// 设置body-parse
app.use( bodyParse.urlencoded({extended: true}) );
// 设置cookies
app.use((req, res, next)=>{
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    if( req.cookies.get('userInfo') ){
        try {
            req.userInfo = JSON.parse( req.cookies.get('userInfo') );
            User.findById(req.userInfo._id).then((userInfo)=>{
                req.userInfo.isAdmin = Boolean( userInfo.isAdmin );
                next();
            });
        } catch (error) {
            next();
        }
    }else{
        next();
    }
});
// 访问后台页面
app.use('/admin',require('./router/admin'));
// 访问api接口
app.use('/api',require('./router/api'));
// 访问页面
app.use('/',require('./router/main'));

mongoose.connect('mongodb://localhost:27018/blog',function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(2020);
    }
});