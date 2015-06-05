// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our order model
var orderSchema = mongoose.Schema({
    created: {type: Date, default: Date.now},
    lastRequestTimestamp: {type: Date},
    username: String,
    images: {type: Array, default: []},
    chair_qty: Number,
    umbrella_qty: Number,
    cooler_qty: Number,
    total: Number,
    account: {
        email: {type: String, trim: true},
        password: String
    },
    accountActive: {type: Boolean, default: true}
});

// generating a hash
orderSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Order', orderSchema);
