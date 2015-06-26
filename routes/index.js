var request = require('request');
var fs = require('fs');
var async = require('async');
var util=require("util");
var path=require("path");

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

    app.get('/destinations', function (req, res) {
        res.render('destinations', {title: 'Rent Ride Return'});
    });

    app.get('/winter', function (req, res) {
        res.render('winter', {title: 'Rent Ride Return'});
    });

    app.get('/confirm/:order', function (req, res) {
        var order = req.params.order;
        console.log(order.length);
        res.render('confirm', {order: order});
    });

    app.get('/paymentConfirm', function (req, res) {
        //go query the order by ordernum and mark orderStatus as paid
        console.log("orderNum = "+req.session.orderNumber);
        
        Order.findOne({orderNumber: req.session.orderNumber}, function(err,order){
            if(!err){
                console.log(order);
            }

        });

        res.render('paymentConfirm', {title: 'Rent Ride Return'});
    });

    app.get('/payment', function (req, res) {
        res.render('payment', {title: 'Rent Ride Return'});
    });


    // ORDER SECTION =========================
    app.post('/placeOrder', function (req, res) {
        console.log(req.body);
        var newOrder = new Order();

        newOrder.orderDate = req.body.date;
        newOrder.orderLocation = req.body.location;

        //TODO: not this. Loop through all items from inventory
        var basicChairOrder = {};
        basicChairOrder.type = "chair";
        basicChairOrder.price = 8.00;
        basicChairOrder.qty = req.body.basicChair_qty ? req.body.basicChair_qty : 0;

        var deluxeChairOrder = {};
        deluxeChairOrder.type = "fancy chair";
        deluxeChairOrder.price = 13.00;
        deluxeChairOrder.qty = req.body.deluxeChair_qty ? req.body.deluxeChair_qty : 0;

        var basicComboOrder = {};
        basicComboOrder.type = "basic combo";
        basicComboOrder.price = 15.00;
        basicComboOrder.qty = req.body.basicCombo_qty ? req.body.basicCombo_qty: 0;

        var deluxeComboOrder = {};
        deluxeComboOrder.type = "deluxe combo";
        deluxeComboOrder.price = 15.00;
        deluxeComboOrder.qty = req.body.deluxeCombo_qty ? req.body.deluxeCombo_qty: 0;

        var umbrellaOrder = {};
        umbrellaOrder.type = "umbrella";
        umbrellaOrder.price = 15.00;
        umbrellaOrder.qty = req.body.umbrella_qty ? req.body.umbrella_qty: 0;

        newOrder.items = [basicChairOrder,deluxeChairOrder,basicComboOrder,deluxeComboOrder, umbrellaOrder];

        newOrder.orderTotal = (basicChairOrder.price*basicChairOrder.qty) +
        (deluxeChairOrder.price*deluxeChairOrder.qty)+
        (basicComboOrder.price*basicComboOrder.qty)+
        (deluxeComboOrder.price*deluxeComboOrder.qty)+
        (umbrellaOrder.price*umbrellaOrder.qty);
        
        console.log(newOrder);

        res.render('checkout_1', {order:newOrder});
    });

    app.post('/saveeOrder', function (req, res) {
        console.log(req.body);
        var newOrder = new Order();

        //TODO: Make this a random token gen
        newOrder.orderNumber = Math.floor(Math.random()*1000000);
        newOrder.orderTimestamp = (new Date()).toISOString();
        newOrder.orderDate = req.body.date;
        newOrder.orderLocation = req.body.location;

        //TODO: not this. Loop through all items from inventory
        var basicChairOrder = {};
        basicChairOrder.type = "chair";
        basicChairOrder.price = 8.00;
        basicChairOrder.qty = req.body.basicChair_qty ? req.body.basicChair_qty : 0;

        var deluxeChairOrder = {};
        deluxeChairOrder.type = "fancy chair";
        deluxeChairOrder.price = 13.00;
        deluxeChairOrder.qty = req.body.deluxeChair_qty ? req.body.deluxeChair_qty : 0;

        var basicComboOrder = {};
        basicComboOrder.type = "basic combo";
        basicComboOrder.price = 15.00;
        basicComboOrder.qty = req.body.basicCombo_qty ? req.body.basicCombo_qty: 0;

        var deluxeComboOrder = {};
        deluxeComboOrder.type = "deluxe combo";
        deluxeComboOrder.price = 15.00;
        deluxeComboOrder.qty = req.body.deluxeCombo_qty ? req.body.deluxeCombo_qty: 0;

        var umbrellaOrder = {};
        umbrellaOrder.type = "umbrella";
        umbrellaOrder.price = 15.00;
        umbrellaOrder.qty = req.body.umbrella_qty ? req.body.umbrella_qty: 0;

        newOrder.items = [basicChairOrder,deluxeChairOrder,basicComboOrder,deluxeComboOrder, umbrellaOrder];

        newOrder.orderTotal = (basicChairOrder.price*basicChairOrder.qty) +
        (deluxeChairOrder.price*deluxeChairOrder.qty)+
        (basicComboOrder.price*basicComboOrder.qty)+
        (deluxeComboOrder.price*deluxeComboOrder.qty)+
        (umbrellaOrder.price*umbrellaOrder.qty);
        
        console.log(newOrder);

        newOrder.save(function(err){
            if (err){
                // send err
                res.send(err);
            } else {
                req.session.orderNumber =  newOrder.orderNumber;
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