var request = require('request');
var fs = require('fs');
var async = require('async');
var util=require("util");
var path=require("path");
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

//Database Model Requirements
var mongoose = require("mongoose");
var Order = require('../models/orders');
var ObjectID = require('mongodb').ObjectID;

//order constats
var max_orders = 100;
var inventory = require('../config/inventory');

module.exports = function (app, passport) {

// =============================================================================
// HOME, DETINATION, AND CHECKOUT ROUTES =====================================
// =============================================================================

    app.get('/', function (req, res) {
        if (req.user) {
            res.redirect('/intro');
        } else {
            res.render('index', {title: 'Rent Ride Return'});
        }
    });

    app.get('/how-it-works', function (req, res) {
        res.render('destinations', {title: 'Rent Ride Return'});
    });

    app.get('/beach', function (req, res) {
        res.render('index', {title: 'Rent Ride Return'});
    });

    app.get('/winter', function (req, res) {
        res.render('winter', {title: 'Rent Ride Return'});
    });

    app.get('/camping', function (req, res) {
        res.render('camping', {title: 'Rent Ride Return'});
    });

    app.get('/checkout1/', function (req, res) {
        res.render('checkout_1', {title: 'Rent Ride Return Checkout'});
    });

    app.get('/checkout2/', function (req, res) {
        res.render('checkout_2', {title: 'Rent Ride Return Checkout'});
    });

    app.get('/about/', function (req, res) {
        res.render('about', {title: 'Rent Ride Return Checkout'});
    });

    app.get('/faq/', function (req, res) {
        res.render('faq', {title: 'Rent Ride Return Checkout'});
    });

    app.get('/terms/', function (req, res) {
        res.render('terms', {title: 'Rent Ride Return Checkout'});
    });

    app.get('/paymentConfirm', function (req, res) {
        if (!req.session.order){
            res.redirect('/');
            return;
        }
 
        //TODO: Put all of this in a helper function
        // getOrder(req.session.order._id, function (order) {
        //     console.log(order);
        // });       
        Order.findOne({_id: req.session.order._id}, function(err,order){

            if(order){
                //go query the order by ordernum and mark orderStatus as paid
                order.orderStatus = "Paid";
                order.save();

                //organize information for order summary in email

                var results = calcNYCTax(order.orderTotal);
                var orderTotal = results[0];
                var taxAmt = results[1];
                var total = results[2];

                var thisOrder;
                var orderItemTxt="";
                for (var i=0; i < order.items.length; i++){
                    thisOrder = order.items[i];
                    if (thisOrder.qty){
                        orderItemTxt += "Item: " + thisOrder.type + " | \n";
                        orderItemTxt += "Quantity:  " + thisOrder.qty + " | \n";
                        orderItemTxt += "Price:  $" + thisOrder.price + " | \n";
                        orderItemTxt += "******************\n\n";
                    }
                }

                //send user a confirmation email

                var sendgridOptions = {
                    auth: {
                        api_user: process.env.SENDGRID_USERNAME,
                        api_key: process.env.SENDGRID_PASSWORD
                    }
                };

                var mailer = nodemailer.createTransport(sgTransport(sendgridOptions));

                var email = {
                    to: [order.email],
                    from: 'orders@rentridereturn.com',
                    subject: 'Rent Ride Return Order Confirmation',
                    text: 'Hey!\n\n' +
                    'Thanks for renting from RentRideReturn.com!\n' +
                    'Your order will be delivered to your pick-up location the day of your trip.\n'+
                    'Save the trees and don\'t print this email.\n\n'+
                    'Below is your order information:\n\n'+
                    'Order Date: ' + order.created + '\n\n' +
                    'Order Number: ' + order.orderNumber + '\n\n' +
                    'Rental Start Date: ' + order.orderDate + '\n\n'+
                    'Rental End Date: ' + order.orderDate + '\n\n'+
                    'Delivery Method: Bus Pick-up\n\n'+
                    'Delivery Address: ' + order.orderLocation + '\n\n'+
                    'Item Summary:\n\n'+ orderItemTxt +
                    'Item(s) Subtotal: $' + orderTotal + ' | \n'+
                    'Tax: $' + taxAmt + '| \n'+
                    'Delivery: FREE | \n'+
                    'Order Total: $' + total + '\n\n'+

                    'Rental Terms:\n\n'+
                    'Rentals must be returned to NYC Beach Bus Staff at your initial Brooklyn departure location.  Rentals cannot be returned to our beach staff.\n\n'+
                    'In the event you miss the bus, you are still liable for rental fees.\n\n'+
                    'All  rentals must be returned on the same day. In the event you fail to return the product on your return trip or not at all, a late fee of '+
                    'forty dollars ($40.00) will be charged to the payment card you used to pay the Rental Fee or to any other payment card included in your '+
                    'account information that you have provided to RRR for every day that you are late returning the Products, and you agree to pay such late fees, '+
                    'up to an amount not to exceed the Retail Value plus applicable sales tax (plus the Rental Fee). \n\n'+
                    'You are responsible for loss, destruction or damage to the Products due to theft, disappearance, fire, major irreparable stains or any other cause, '+
                    'other than normal wear and tear. Normal wear and tear encompasses minor stains and rips. If You return a Product that is damaged beyond normal wear '+
                    'and tear then you agree that we shall charge you, and you shall pay, for the price for repairing or replacing the Product, as determined in our '+
                    'discretion, up to the Retail Value for the Product as indicated on on our site.\n\n'+
                    'Thanks for renting. See you on the beach!\n\n\n'
                };

                mailer.sendMail(email, function (err) {
                    if (err) {
                        console.log('error sending mail');
                        console.log(err);
                    }
                });
                console.log(email.text);
                res.render('paymentConfirm', {order: order, total: total, title: 'Rent Ride Return'});
            } else {
                res.send(err);
            }
        });

    });

    app.get('/paymentError', function (req, res) {
        res.render('paymentError', {title: 'Rent Ride Return'});
    });

// =============================================================================
// ORDER FLOW ROUTES =====================================================
// =============================================================================

    app.post('/placeOrder', function (req, res) {

        var newOrder = new Order();

        newOrder.orderDate = req.body.date;
        newOrder.orderLocation = req.body.location;

        //TODO: not this. Loop through all items from inventory
        var classicChairOrder = {};
        classicChairOrder.type = "Classic half body chair";
        classicChairOrder.price = 8.00;
        classicChairOrder.id = "B0";
        classicChairOrder.qty = req.body.classicChair_qty ? req.body.classicChair_qty : 0;
        classicChairOrder.img = 'img/basic_chair.jpg';

        var deluxeChairOrder = {};
        deluxeChairOrder.type = "Deluxe full body chair";
        deluxeChairOrder.price = 14.00;
        deluxeChairOrder.id = "B1";
        deluxeChairOrder.qty = req.body.deluxeChair_qty ? req.body.deluxeChair_qty : 0;
        deluxeChairOrder.img = 'img/deluxe_chair.jpg';

        var classicComboOrder = {};
        classicComboOrder.type = "Classic chair & umbrella";
        classicComboOrder.price = 15.00;
        classicComboOrder.id = "B2";
        classicComboOrder.qty = req.body.classicCombo_qty ? req.body.classicCombo_qty: 0;

        var deluxeComboOrder = {};
        deluxeComboOrder.type = "Deluxe chair & umbrella";
        deluxeComboOrder.price = 20.00;
        deluxeComboOrder.id = "B3";
        deluxeComboOrder.qty = req.body.deluxeCombo_qty ? req.body.deluxeCombo_qty: 0;

        var umbrellaOrder = {};
        umbrellaOrder.type = "Umbrella";
        umbrellaOrder.price = 10.00;
        umbrellaOrder.id = "B4";
        umbrellaOrder.qty = req.body.umbrella_qty ? req.body.umbrella_qty: 0;

        newOrder.items = [classicChairOrder,deluxeChairOrder,classicComboOrder,deluxeComboOrder, umbrellaOrder];

        newOrder.orderTotal = (classicChairOrder.price*classicChairOrder.qty) +
        (deluxeChairOrder.price*deluxeChairOrder.qty)+
        (classicComboOrder.price*classicComboOrder.qty)+
        (deluxeComboOrder.price*deluxeComboOrder.qty)+
        (umbrellaOrder.price*umbrellaOrder.qty);
        
        //store the new order
        req.session.order = newOrder;

        var results = calcNYCTax(newOrder.orderTotal);
        var orderTotal = results[0];
        var taxAmt = results[1];
        var total = results[2];

        res.render('checkout_1', {order:newOrder, orderTotal: orderTotal, taxAmt: taxAmt, total: total});
    });

    app.post('/saveOrder', function (req, res) {

        var order = req.session.order;
        var newOrder = new Order();

        //checkout information
        newOrder.passengerID = req.body.passengerID;
        newOrder.email = req.body.email;
        newOrder.phone = req.body.phone;
        newOrder.first_name = req.body.first_name;
        newOrder.last_name = req.body.last_name;

        //TODO: Make this the last 6 digits of id
        // console.log("id: "+newOrder._id);
        // console.log("orderNumber: "+newOrder._id.substring(0,6));

        newOrder.orderNumber = Math.floor(Math.random()*1000000);
        newOrder.orderDate = order.orderDate;
        newOrder.orderLocation = order.orderLocation;
        newOrder.orderTotal = order.orderTotal;
        newOrder.items = order.items;

        //store the updated order
        req.session.order = newOrder;

        var results = calcNYCTax(newOrder.orderTotal);
        var orderTotal = results[0];
        var taxAmt = results[1];
        var total = results[2];

        newOrder.save(function(err){
            if (err){
                // send err
                res.send(err);
            } else {
                res.render('checkout_2', {order:newOrder, orderTotal: orderTotal, taxAmt: taxAmt, total: total});
            }
        });

    });

    app.get('/getOrderStatus', getOrderStatus, function(req, res){
        var result = req.orderStatusResult;
        //B0 max = 50
        //B1 max = 40
        //B2 max  = 15
        //B3 max = 15
        //B4 max = 15
        // for (var i = 0; i < inventory.length; i++) {
        // inventory[0]["max_qty"];
        // inventory[0]["id"];
        // }

        res.send(result);
    });


// =============================================================================
// ADMIN =====================================================
// =============================================================================


    app.get('/admin', getAllOrders, function(req, res){
        console.log(req.allOrders);
        res.render('admin', {orders: req.allOrders, title: 'Admin Panel'});
    });


// =============================================================================
// ROUTE TO PAGE NOT FOUND =====================================================
// =============================================================================

    app.get('*', function (req, res) {
        res.render('404', {layout: false});
    });

// =============================================================================
// END OF ROUTES  ==============================================================
// =============================================================================
};


// =============================================================================
// MIDDLEWARE AND UTILITY FUNCTIONS  ===========================================
// =============================================================================


function getCurrentPath(req, res, next) {
    req.session.redirectTo = req.path;
    return next();
}

function calcNYCTax(subtotal){
    var NYCtax = .08875;
    var orderTotal = Math.round(subtotal*100)/100;
    var total = subtotal * (1+NYCtax);
    var total = Math.round(total*100)/100;
    var taxAmt = total - orderTotal;
    //format for web
    taxAmt = taxAmt.toFixed(2);
    orderTotal = orderTotal.toFixed(2);
    total = total.toFixed(2);
    return [orderTotal, taxAmt, total];
}

function formatDate() {
    var date = new Date();

    var m = (date.getMonth() + 1).toString();
    var d = date.getDate().toString();
    var y = date.getFullYear().toString();
    return m + "-" + d + "-" + y;
}

function getAllOrders(req, res, next){
    
    Order.find({"orderStatus":"Paid"}, function(err, orders){
        req.allOrders = orders;
        return next();
    });
}
function getOrderStatus(req, res, next) {
    //find out how many of each item has been booked for this date and location
    var date = req.query.date;
    Order.aggregate(
        {$unwind:"$items"},
        {$match:{"orderDate":date,"orderStatus":"Paid"}},
        {$group:{
            _id: "$items.id",
            total_cost:{ $sum:{ $multiply:["$items.qty","$items.price"] } },
            total_ordered:{$sum:"$items.qty"}
        }},
        function (err, result) {
        if (!result) {
            //none ordered. max avail.
            req.orderStatusResult = null;
            return next();
        } else {
            //aggregate by this item
            req.orderStatusResult = result;
            return next();
        }
    });
    
    // Order.aggregate({ $group:{_id: "$accountActive",total:{$sum:"$orderTotal"},num_orders:{$sum:1}} },
    //     function (err, result) {
    //     if (!result) {
    //         //none ordered. max avail.
    //         return null;
    //     } else {
    //         //aggregate by this item
    //         console.log(result);
    //         return result;
    //     }
    // });
}