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

var max_orders = 100;

module.exports = function (app, passport) {

// =============================================================================
// HOME, PROFILE, GALLERY AND SHARE ROUTES =====================================
// =============================================================================

    // show the home page (will also have our login links)
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
        res.render('beach', {title: 'Rent Ride Return'});
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

    app.get('/paymentConfirm', function (req, res) {
        
        Order.findOne({_id: req.session.order._id}, function(err,order){

            if(order){
                //go query the order by ordernum and mark orderStatus as paid
                order.orderStatus = "Paid";
                order.save();

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
                    from: 'hello@rentridereturn.com',
                    subject: 'Your Rent Ride Return Order',
                    text: 'Hey there!\n\n' +
                    'Thanks for renting with RentRideReturn!\n\n' +
                    'Here\'s your order information:\n\n'+
                    'Your order number is ' + order.orderNumber + '.\n' +
                    'You can pick up your gear at the ' + order.orderLocation + ' location ' +
                    'on ' + order.orderDate + '.\n\n'+
                    'See you on the beach!\n\n'+
                    'xoxo, RRR'
                };

                mailer.sendMail(email, function (err) {
                    if (err) {
                        console.log('error sending mail');
                        console.log(err);
                    }
                });

                res.render('paymentConfirm', {order:order, title: 'Rent Ride Return'});
            } else {
                res.send(err);
            }
        });

    });

    app.get('/paymentError', function (req, res) {
        res.render('paymentError', {title: 'Rent Ride Return'});
    });

    app.get('/paymentTest', function (req, res) {
        res.render('paymentConfirm', {title: 'Rent Ride Return'});
    });

    // ORDER SECTION =========================
    app.post('/placeOrder', function (req, res) {

        var newOrder = new Order();

        newOrder.orderDate = req.body.date;
        newOrder.orderLocation = req.body.location;

        //TODO: not this. Loop through all items from inventory
        var basicChairOrder = {};
        basicChairOrder.type = "Basic half body chair";
        basicChairOrder.price = 8.00;
        basicChairOrder.qty = req.body.basicChair_qty ? req.body.basicChair_qty : 0;
        basicChairOrder.img = 'img/basic_chair.jpeg';

        var deluxeChairOrder = {};
        deluxeChairOrder.type = "Deluxe full body chair";
        deluxeChairOrder.price = 13.00;
        deluxeChairOrder.qty = req.body.deluxeChair_qty ? req.body.deluxeChair_qty : 0;
        deluxeChairOrder.img = 'img/beach_chair.png';

        var basicComboOrder = {};
        basicComboOrder.type = "Basic chair & umbrella";
        basicComboOrder.price = 15.00;
        basicComboOrder.qty = req.body.basicCombo_qty ? req.body.basicCombo_qty: 0;

        var deluxeComboOrder = {};
        deluxeComboOrder.type = "Deluxe chair & umbrella";
        deluxeComboOrder.price = 18.00;
        deluxeComboOrder.qty = req.body.deluxeCombo_qty ? req.body.deluxeCombo_qty: 0;

        var umbrellaOrder = {};
        umbrellaOrder.type = "Umbrella";
        umbrellaOrder.price = 10.00;
        umbrellaOrder.qty = req.body.umbrella_qty ? req.body.umbrella_qty: 0;

        newOrder.items = [basicChairOrder,deluxeChairOrder,basicComboOrder,deluxeComboOrder, umbrellaOrder];

        newOrder.orderTotal = (basicChairOrder.price*basicChairOrder.qty) +
        (deluxeChairOrder.price*deluxeChairOrder.qty)+
        (basicComboOrder.price*basicComboOrder.qty)+
        (deluxeComboOrder.price*deluxeComboOrder.qty)+
        (umbrellaOrder.price*umbrellaOrder.qty);
        
        //store the new order
        req.session.order = newOrder;

        res.render('checkout_1', {order:newOrder});
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

        newOrder.save(function(err){
            if (err){
                // send err
                res.send(err);
            } else {
                res.render('checkout_2', {order:newOrder});
                // res.redirect('confirm/:'+newOrder);
            }
        });

    });

    app.get('/getOrderStatus', function(req, res){
        var result = getOrderStatus();
        res.send(result);
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

function formatDate() {
    var date = new Date();

    var m = (date.getMonth() + 1).toString();
    var d = date.getDate().toString();
    var y = date.getFullYear().toString();
    return m + "-" + d + "-" + y;
}

function getOrderStatus(item, date) {
    //find out how many of each item has been booked for this date and location

    db.orders.aggregate(
        {$unwind:"$items"},
        {$match:{"items.type":"cooler"}},
        {$group:{
            _id: "$items.type",
            total_cost:{ $sum:{ $multiply:["$items.qty","$items.price"] } },
            total_ordered:{$sum:"$items.qty"}
        }},
        function (err, result) {
        if (!result) {
            //none ordered. max avail.
            return null;
        } else {
            //aggregate by this item
            console.log(result);
            return result;
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