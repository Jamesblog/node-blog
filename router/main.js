const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');
const markDown = require('markdown').markdown;

router.get('/',(req,res,next)=>{

    const data = {
        categoryType: req.query.type || '',
        count: 0,
        page: Number(req.query.page || 1),
        limit: 2,
        skip: 0,
        pages: 0,
        userInfo: req.userInfo,
        categories: []
    };
    let where = {};
    if( data.categoryType != '' ) where.category = data.categoryType;

    Category.find().sort({_id: -1}).then((categories)=>{
        data.categories = categories;
        return Content.where( where ).count();
    }).then((count)=>{
        data.count = count;
        data.pages = Math.ceil( data.count/data.limit );
        data.page = Math.min( data.page, data.pages );
        data.page = Math.max( data.page, 1 );
        data.skip = (data.page-1)*data.limit;
        return Content.where( where ).find().sort({addTime: -1}).limit( data.limit ).skip( data.skip ).populate( ['category','user'] );
    }).then((contents)=>{
        data.contents = contents
        res.render('main/index',data);
    }).catch(()=>{});  
});

router.get('/views',(req, res, next)=>{
    const _id = req.query.page;
    Content.findOne({_id}).then((content)=>{
        content.view++;
        content.save();
        res.render('main/detail',{
            userInfo: req.userInfo,
            content
        });
    })
    
})

module.exports = router;