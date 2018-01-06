const mongoose = require('mongoose');
const categoriseSchema = require('../schemas/categorise');

module.exports = mongoose.model('Category', categoriseSchema);