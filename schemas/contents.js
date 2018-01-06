const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    // 关联字段 - 内容分类的id
    category: {
        // 引用类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Category'
    },
    user: {
        // 引用类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'
    },
    addTime: {
        type: Date,
        default: new Date()
    },
    view: {
        type: Number,
        default: 0
    },
    title: String,
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comment: {
        type: Array,
        default: []
    }
});