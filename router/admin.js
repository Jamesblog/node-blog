const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');

router.use((req, res, next)=>{
    if(!req.userInfo.isAdmin){
        res.send('对不起，您不具有此页面的访问权限');
        return;
    }
    next();
});

router.get('/',(req,res,next)=>{
    res.render('admin/index',{
        userInfo: req.userInfo
    });
});

router.get('/user',(req,res,next)=>{
    /**
     * 读取目前的用户数据
     * limit(Number) : 限制获取的数据条数
     * skip() : 忽略数据的条数
     * users : 所有的用户信息
     * count : 总查询页数
     * pages : 总页数
     * limit : 每页显示条数
     * page : 当前页
     */

    let page = Number(req.query.page || 1);
    let limit = 10;
    let skip = 0;
    let pages = 0;

    // User 返回查询的条数
    User.count().then((count)=>{
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;
        User.find().limit( limit ).skip( skip ).then((users)=>{
            res.render('admin/user_index',{
                userInfo: req.userInfo,
                users,
                count,
                pages,
                limit,
                page
            });
        }) 
    });     
});

router.get('/category',(req,res,next)=>{
    /**
     * 读取目前的用户数据
     * limit(Number) : 限制获取的数据条数
     * skip() : 忽略数据的条数
     * users : 所有的用户信息
     * count : 总查询页数
     * pages : 总页数
     * limit : 每页显示条数
     * page : 当前页
     */

    let page = Number(req.query.page || 1);
    let limit = 10;
    let skip = 0;
    let pages = 0;

    // Category 返回查询的条数
    Category.count().then((count)=>{
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;
        Category.find().sort({_id: -1}).limit( limit ).skip( skip ).then((categories)=>{
            res.render('admin/category_index',{
                userInfo: req.userInfo,
                categories,
                count,
                pages,
                limit,
                page
            });
        }) 
    }); 
});

router.get('/category/add',(req,res,next)=>{
    res.render('admin/category_add',{
        userInfo: req.userInfo
    });
});

router.post('/category/add',(req,res,next)=>{
    let name = req.body.name || '';
    if( name == '' ){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: "分类名称不能为空"
        });
        return;
    }

    Category.findOne({name}).then((categoryName)=>{
        if( categoryName ){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: "该分类已经存在"
            });
            return Promise.reject();
        } else {
            return new Category({name}).save();
        }
    }).then((newCategory)=>{
        if(newCategory){
            res.render('admin/success',{
                userInfo: req.userInfo,
                msg: "分类添加成功",
                url: '/admin/category'
            })
        }
    }).catch(()=>{});  
});

router.get('/category/edit',(req, res, next)=>{
    let _id = req.query.id || '';
    Category.findOne({_id}).then((category)=>{
        if(!category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: '分类名称不存在'
            });
        } else {
            res.render('admin/category_edit',{
                userInfo: req.userInfo,
                category
            });
        }
    }); 
});

router.post('/category/edit',(req, res, next)=>{
    let _id = req.query.id || '';
    let name = req.body.name || '';
    Category.findOne({_id}).then((category)=>{
        if(!category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: '分类名称不存在'
            });
            return Promise.reject();
        } else {
            if(name == category.name){
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    msg: '分类修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                return Category.findOne({_id: {$ne: _id}, name})
            }
        }
    }).then((sameCategory)=>{
        if(sameCategory){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: '数据库中存在同名分类'
            });
            return Promise.reject(); 
        } else {
            return Category.update({_id}, {name});
        }
    }).then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '分类修改成功',
            url: '/admin/category'
        });
    }).catch(()=>{});
});

router.get('/category/delete',(req, res, next)=>{
    let _id = req.query.id;
    Category.remove({_id}).then((delCategory)=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '删除分类成功',
            url: '/admin/category'
        }); 
    });
});

router.get('/content',(req, res, next)=>{
    /**
     * 读取目前的用户数据
     * limit(Number) : 限制获取的数据条数
     * skip() : 忽略数据的条数
     * users : 所有的用户信息
     * count : 总查询页数
     * pages : 总页数
     * limit : 每页显示条数
     * page : 当前页
     */

    let page = Number(req.query.page || 1);
    let limit = 10;
    let skip = 0;
    let pages = 0;

    // Content 返回查询的条数
    Content.count().then((count)=>{
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;
        Content.find().sort({_id: -1}).limit( limit ).skip( skip ).populate( ['category','user'] ).then((contents)=>{
            res.render('admin/content_index',{
                userInfo: req.userInfo,
                contents,
                count,
                pages,
                limit,
                page
            });
        }) 
    }); 
});

router.get('/content/add',(req, res, next)=>{
    Category.find().then((categories)=>{
        res.render('admin/content_add',{
            userInfo: req.userInfo,
            categories
        })
    });
});

router.post('/content/add',(req, res, next)=>{
    const category = req.body.category;
    const title = req.body.title;
    const description = req.body.description;
    const content = req.body.content;
    const user = req.userInfo._id.toString();
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章所属栏目不能为空'
        });
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章标题不能为空'
        });
    }
    new Content({category, title, description, content, user}).save().then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '文章保存成功',
            url: '/admin/content'
        })
    })
});

router.get('/content/edit',(req, res, next)=>{
    let _id = req.query.id;
    let categoryList = [];
    Category.find().then((categories)=>{
        categoryList = categories;
        return  Content.findOne({_id}).populate('category');
    }).then((content)=>{
        if(!content){
            render('admin/error',{
                userInfo: req.userInfo,
                msg: '该文章不存在'
            });
        } else {
            res.render('admin/content_edit',{
                userInfo: req.userInfo,
                content,
                categoryList
            })
        }
    }).catch(()=>{});  ;
});

router.post('/content/edit',(req, res, next)=>{
    let _id = req.query.id;
    const category = req.body.category;
    const title = req.body.title;
    const description = req.body.description;
    const content = req.body.content;
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章所属栏目不能为空'
        });
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章标题不能为空'
        });
    }

    Content.update({_id},{category, title, description, content}).then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '保存成功',
            url: `/admin/content/edit?id=${_id}`
        })
    });
});

router.get('/content/delete',(req, res, next)=>{
    let _id = req.query.id;
    Content.remove({_id}).then((delContent)=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '删除文章成功',
            url: '/admin/content'
        }); 
    });
});

module.exports = router;