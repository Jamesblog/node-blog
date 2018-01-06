const mongoose = require('mongoose');
const usersSchema = require('../schemas/users');

module.exports = mongoose.model('User', usersSchema);