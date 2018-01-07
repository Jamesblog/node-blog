const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');

// 定义统一返回格式
let reponseData;
router.use((req,res,next)=>{
    reponseData = {
        code: 0,
        msg: ''
    }
    next();
});

router.post('/user/register',(req,res,next)=>{
    const [username,password,repassword] = [req.body.username,req.body.password,req.body.repassword];
    const reg = /^[^<>"'$\|?~*&@(){}]*$/;
    if(username == ''){
        reponseData = {code: 1,msg: '用户名不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(username)){
        reponseData = {code: 1,msg: '用户名不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(password == ''){
        reponseData = {code: 2,msg: '密码不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(password)){
        reponseData = {code: 2,msg: '密码不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(repassword != password){
        reponseData = {code: 3,msg: '两次输入的密码不一致'}
        res.json(reponseData);
        return;
    }
    console.log( '====前台用户注册信息====='+JSON.stringify( reponseData )+'=========' );
    User.findOne({ username }).then((userInfo)=>{
        console.log( '====数据库查询用户是否注册返回信息====='+JSON.stringify( reponseData )+'=========' );
        if(userInfo){
            reponseData = {code: 4,msg: '该用户名已经被注册'}
            res.json(reponseData);
            return;
        }else{
            // 保存用户信息到数据库中
            let user = new User({username, password});
            return user.save();
        }
    }).then((saveUserInfo)=>{
        if(saveUserInfo){
            reponseData.msg = '注册成功';
            reponseData.userInfo = {
                _id: saveUserInfo._id,
                username: saveUserInfo.username
            }
            req.cookies.set('userInfo', JSON.stringify({
                _id: saveUserInfo._id,
                username: saveUserInfo.username
            }));
            res.json(reponseData);
        }
        console.log( '=====用户注册保存成功===='+saveUserInfo+'=========' );
    }).catch(()=>{});  
});

router.post('/user/login',(req,res)=>{
    const [username,password] = [req.body.username,req.body.password];
    const reg = /^[^<>"'$\|?~*&@(){}]*$/;
    if(username == ''){
        reponseData = {code: 1,msg: '用户名不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(username)){
        reponseData = {code: 1,msg: '用户名不能含有特殊字符'}
        res.json(reponseData);
        return;
    }
    if(password == ''){
        reponseData = {code: 2,msg: '密码不能为空'}
        res.json(reponseData);
        return;
    }
    if(!reg.test(password)){
        reponseData = {code: 2,msg: '密码不能含有特殊字符'}
        res.json(reponseData);
        return;
    }

    console.log( '====前台用户登录信息====='+JSON.stringify( reponseData )+'=========' );
    User.findOne({ username, password }).then((userInfo)=>{
        console.log( '====数据库查询用户登录返回信息====='+userInfo+'=========' );
        if(userInfo){
            reponseData = {code: 0,msg: '登录成功'}
            reponseData.userInfo = {
                _id: userInfo._id,
                username: userInfo.username
            }
            req.cookies.set('userInfo', JSON.stringify({
                _id: userInfo._id,
                username: userInfo.username
            }));
            res.json(reponseData);
        }else{
            reponseData = {code: 4,msg: '用户名或密码不能不正确'}
            res.json(reponseData);
        }
    });
});

router.post('/user/loginOut',(req,res, next)=>{
    req.cookies.set('userInfo',null);
    res.json(reponseData);
});

router.post('/comment',(req, res, next)=>{
    const _id = req.body.commentId;
    const data = {
        userName: req.userInfo.username,
        postTime: new Date(),
        comment: req.body.commentContent
    };

    Content.findOne({_id}).then((content)=>{
        content.comment.push( data );
        return content.save();
    }).then((newContent)=>{
        reponseData.msg = "评论成功";
        res.json({
            reponseData,
            commentList: newContent.comment
        });
    }).catch(()=>{});  
});

router.get('/comment',(req, res, next)=>{
    const _id = req.query.commentId || '';
    Content.findOne({_id}).then((content)=>{
        reponseData.msg = "获取成功";
        res.json({reponseData, commentList: content.comment});
    })
})

module.exports = router;