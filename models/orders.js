// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our order model
var orderSchema = mongoose.Schema({
    created: {type: Date, default: Date.now},
    lastRequestTimestamp: {type: Date},
    orderNumber: {type: Number},
    orderStatus: {type: String, default:"Unpaid"},
    orderDate: {type: Date},
    orderLocation: String,
    username: String,
    images: {type: Array, default: []},
    items: [
        {
          type: {type: String},
          price: {type: Number},
          qty: {type: Number, default: 0}
        }
    ],
    total:  {type: Number, default: 0},
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

// create the model for orders and expose it to our app
module.exports = mongoose.model('Order', orderSchema);