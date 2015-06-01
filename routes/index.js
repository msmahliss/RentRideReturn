var request = require('request');
var fs = require('fs');
var async = require('async');
var util=require("util");
var path=require("path");

//Database Model Requirements
var mongoose = require("mongoose");
var Order = require('../models/orders');
var ObjectID = require('mongodb').ObjectID;

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

    // PROFILE SECTION =========================
    app.get('/order', getCurrentPath, function (req, res) {
        var newOrder = new Order();
        // var user = req.user;
        newOrder.amount = req.body.amount;
        newOrder.item = req.body.amount;
        newOrder.orderTimestamp = (new Date()).toISOString();

        user.subscription = user.subscription || {};
        
        newOrder.save(function(err){
            if (err){
                // send err
            } else {
                // do stuff
            }
        });

        res.render('order', {user: user});
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

function getInstagramVideos(req, res, next) {
    var user = req.user;
    if (user) {
        var apiCall = "https://api.instagram.com/v1/users/self/media/recent/?access_token=";
        var token = user.instagram.token;
        var media_json,
            media,
            next_max_id = "",
            pages = 0,
            urls = [];

        function igApiCall(next_page) {
            request.get(apiCall + token + "&max_id=" + next_page, function (err, resp, body) {
                if (!err) {
                    pages++;
                    media_json = JSON.parse(body);
                    next_page = media_json.pagination.next_max_id;
                    media = media_json.data;
                    var item;

                    for (var i = 0; i < media.length; i++) {
                        item = media[i];
                        if (item.hasOwnProperty("videos") && (urls.length < 4)) {
                            urls.push(item.videos.standard_resolution.url);
                        }
                    }
                } else {
                    res.send('error with Instagram API');
                    return;
                }
                if (next_page && (pages < 5)) {
                    igApiCall(next_page);
                } else {

                    req.user.instagram.IGvideos = urls;
                    req.user.save();
                    return next();
                }
            });
        }

        igApiCall(next_max_id);
    }
}