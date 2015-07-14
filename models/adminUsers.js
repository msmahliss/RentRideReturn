var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var adminUserSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    username: String,
    password: String
}, { strict: false });


// generating a hash
adminUserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


// checking if password is valid
adminUserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.vidcode.password);
};


module.exports = mongoose.model('AdminUser', adminUserSchema);