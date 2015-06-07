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
            res.render('index', {title: 'Rent Ride Return', layout: false});
        }
    });

    app.get('/destinations', function (req, res) {
        res.render('destinations', {title: 'Rent Ride Return', layout: false});
    });

    // PROFILE SECTION =========================
    app.post('/placeOrder', function (req, res) {
        console.log(req.body);

        var newOrder = new Order();
        newOrder.orderTimestamp = (new Date()).toISOString();
        newOrder.username = req.body.last_name;

        var chairOrder = {};
        chairOrder.type = "chair";
        chairOrder.price = 10.00;
        chairOrder.qty = req.body.chair_qty ? req.body.chair_qty : 0;

        var umbrellaOrder = {};
        umbrellaOrder.type = "umbrella";
        umbrellaOrder.price = 15.00;
        umbrellaOrder.qty = req.body.umbrella_qty ? req.body.umbrella_qty: 0;

        var coolerOrder = {};
        coolerOrder.type = "cooler";
        coolerOrder.price = 8.00;
        coolerOrder.qty = req.body.cooler_qty ? req.body.cooler_qty : 0;

        newOrder.items = [chairOrder,umbrellaOrder,coolerOrder];

        newOrder.total = (chairOrder.price*chairOrder.qty) + (umbrellaOrder.price*umbrellaOrder.qty) + (coolerOrder.price*coolerOrder.qty);
        
        newOrder.save(function(err){
            if (err){
                // send err
                res.send(err);
            } else {
                // do stuff
                res.render('confirm', {order: newOrder, layout: false});
            }
        });

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

function getDateMMDDYYYY() {
    var date = new Date();

    var m = (date.getMonth() + 1).toString();
    var d = date.getDate().toString();
    var y = date.getFullYear().toString();
    return m + "-" + d + "-" + y;
}

function getOrderStatus(item, date) {
    //find out how many of each item has been booked for this date

    // db.orders.aggregate(
    //     {$unwind:"$items"},
    //     {$match:{"items.type":"cooler"}},
    //     {$group:{
    //         _id: "$items.type",
    //         total_cost:{ $sum:{ $multiply:["$items.qty","$items.price"] } },
    //         total_ordered:{$sum:1}
    //     }
    // })

    Order.aggregate({ $group:{_id: "$accountActive",total:{$sum:"$total"},num_orders:{$sum:1}} },
        function (err, result) {
        if (!result) {
            //none ordered. max avail.
            res.send("No orders");
        } else {
            //aggregate by this item
            console.log(result);
            res.end();
        }
    });
}