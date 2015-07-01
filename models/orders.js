// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our order model
var orderSchema = mongoose.Schema({
    created: {type: Date, default: Date.now},
    lastRequestTimestamp: {type: Date},
    orderNumber: {type: Number},
    orderStatus: {type: String, default:"Unpaid"},
    orderDate: {type: String},
    orderLocation: String,
    email: String,
    phone: String,
    first_name: String,
    last_name: String,
    passengerID: String,
    orderTotal:  {type: Number, default: 0},
    items: [
        {
          type: {type: String},
          id: {type: String},
          price: {type: Number},
          qty: {type: Number, default: 0},
          img: {type: String}
        }
    ],
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