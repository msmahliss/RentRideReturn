// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var mongoose = require("mongoose");
var request = require('request');

//load the sendrid templates
var signUp = require('../services/sendgrid/templates');

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // VIDCODE LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                User.findOne({'vidcode.email': email}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user){
                        return done(null, false, req.flash('loginMessage', ':(  User not found.'));
                    }

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else {
                        user.social = "vidcode";
                        user.username = user.vidcode.username;
                        return done(null, user);
                    }
                });
            });

        }));

    // =========================================================================
    // VIDCODE SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {

                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({'vidcode.email': email}, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if there's already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already in use.'));
                        }
                        // check password complexity
                        if (password != req.body.passwordconfirm) {
                            return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
                        }
                        if (password.length < 6) {
                            return done(null, false, req.flash('signupMessage', 'Password length must be at least 6 characters.'));
                        }
                        if (password == email) {
                            return done(null, false, req.flash('signupMessage', 'Password must be different from email.'));
                        }
                        if (!(/[0-9]/).test(password)) {
                            return done(null, false, req.flash('signupMessage', 'Password must contain at least one number.'));
                        }
                        if (!(/[a-z]/).test(password)) {
                            return done(null, false, req.flash('signupMessage', 'Password must contain at least one lowercase letter.'));
                        }
                        if (!(/[A-Z]/).test(password)) {
                            return done(null, false, req.flash('signupMessage', 'Password must contain at least one uppercase letter.'));
                        }
                        else {

                            // create the user
                            var newUser = new User();
                            //check to see if the new user is a legacy user
                            mongoose.connection.db.collection('vidcode').findOne({'username': email},
                                function (err, legacyuser) {
                                    if (err) {
                                        return done(err);
                                    }
                                    if (legacyuser) {
                                        newUser.legacyuser = true;
                                    }
                                    //check to see if new user is from Kickstarter
                                    if (req.body.accesscode){
                                        var code = req.body.accesscode;
                                        code = code.toLowerCase();
                                        if (code=='kickstarter') {
                                            newUser.ksbacker = true;
                                        }
                                        else if (code=='hackathon') {
                                            newUser.hackathon = true;
                                            newUser.proUser = true;
                                        }
                                    }
                                    newUser.vidcode.email = email;
                                    newUser.vidcode.password = newUser.generateHash(password);
                                    newUser.social = "vidcode";
                                    newUser.username = req.body.nickname;

                                    newUser.save(function (err) {
                                        if (err)
                                            return done(err);

                                        var sendgridOptions = {
                                            auth: {
                                                api_user: process.env.SENDGRID_USERNAME,
                                                api_key: process.env.SENDGRID_PASSWORD
                                            }
                                        };

                                        var mailer = nodemailer.createTransport(sgTransport(sendgridOptions));

                                        var email = {
                                            to: [newUser.vidcode.email],
                                            from: 'no-reply@vidcode.io',
                                            subject: 'Welcome to Vidcode',
                                            html: signUp
                                        };

                                        mailer.sendMail(email, function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });

                                        // we're not stopping if err so no callback
                                        // log to console. Need some monitoring of errors for entire app
                                        addUserToSendgridList(newUser.vidcode.email, newUser.username );

                                        return done(null, newUser);
                                    });
                                }
                            );
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!req.user.vidcode.email) {
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the email used to connect a local account is being used by another user
                    User.findOne({'vidcode.email': email}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.user;
                            user.vidcode.email = email;
                            user.vidcode.password = user.generateHash(password);
                            user.social = "vidcode";
                            user.username = req.body.nickname;

                            user.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });

        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {
                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'facebook.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                var fbEmail = profile.emails ? (profile.emails[0].value) : '';
                                user.facebook.email = fbEmail.toLowerCase();                                    
                                user.facebook.gender = profile.gender;
                                user.facebook.publicProfile = profile.profileUrl;
                                user.facebook.username = profile.displayName;
                                user.social = "facebook";
                                user.username = user.username || user.facebook.name;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            var fbEmail = profile.emails ? (profile.emails[0].value) : '';
                            newUser.facebook.email = fbEmail.toLowerCase();         
                            newUser.facebook.gender = profile.gender;
                            newUser.facebook.publicProfile = profile.profileUrl;
                            newUser.facebook.username = profile.displayName;
                            newUser.social = "facebook";
                            newUser.username = newUser.facebook.name;


                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                var sendgridOptions = {
                                    auth: {
                                        api_user: process.env.SENDGRID_USERNAME,
                                        api_key: process.env.SENDGRID_PASSWORD
                                    }
                                };

                                var mailer = nodemailer.createTransport(sgTransport(sendgridOptions));
                                
                                var email = {
                                    to: [newUser.facebook.email],
                                    from: 'no-reply@vidcode.io',
                                    subject: 'Welcome to Vidcode',
                                    html: signUp
                                };

                                //dont send signgup emails until template is ready

                                mailer.sendMail(email, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });

                                // we're not stopping if err so no callback
                                // log to console. Need some monitoring of errors for entire app
                                addUserToSendgridList(newUser.facebook.email, profile.displayName );

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    console.log(profile);
                    console.log('token :'+token);
                    console.log('refreshtoken :'+refreshToken);
                    var user = req.user; // pull the user out of the session

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    var fbEmail = profile.emails ? (profile.emails[0].value) : '';
                    user.facebook.email = fbEmail.toLowerCase();         
                    user.facebook.gender = profile.gender;
                    user.facebook.publicProfile = profile.profileUrl;
                    user.facebook.username = profile.displayName;
                    user.social = "facebook";
                    user.username = user.username || user.facebook.name;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }
            });

        }));


    // =========================================================================
    // INSTAGRAM ================================================================
    // =========================================================================
    passport.use(new InstagramStrategy({

            clientID: configAuth.instagramAuth.clientID,
            clientSecret: configAuth.instagramAuth.clientSecret,
            callbackURL: configAuth.instagramAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {
                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'instagram.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)


                            if (!user.instagram.token) {
                                user.instagram.token = token;
                                user.instagram.username = profile.username;
                                user.instagram.displayName = profile.displayName;
                                user.social = "instagram";
                                user.username = user.username || user.instagram.username;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user

                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.instagram.id = profile.id;
                            newUser.instagram.token = token;
                            newUser.instagram.username = profile.username;
                            newUser.instagram.displayName = profile.displayName;
                            newUser.social = "instagram";
                            newUser.username = newUser.instagram.username;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.instagram.id = profile.id;
                    user.instagram.token = token;
                    user.instagram.username = profile.username;
                    user.instagram.displayName = profile.displayName;
                    user.instagram.IGvideos = profile.IGvideos;
                    user.social = "instagram";
                    user.username = user.username || user.instagram.username;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }
            });

        }));


    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'twitter.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.twitter.displayName = profile.displayName;
                                user.social = "twitter";
                                user.username = user.username || user.twitter.username;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;
                            newUser.social = "twitter";
                            newUser.username = newUser.twitter.username;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;
                    user.social = "twitter";
                    user.username = user.username || user.twitter.username;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

            });

        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'google.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.name = profile.displayName;
                                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                                user.social = "google";
                                user.username = user.username || user.google.username;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new User();

                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                            newUser.social = "google";
                            newUser.username = newUser.google.username;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                    user.social = "google";
                    user.username = user.username || user.google.username;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }

            });

        }));

};

function addUserToSendgridList(email, name){

  var postData = '{"email":"' + email + '","name":"' + name + '"}';

  request.post({
          url:'https://api.sendgrid.com/api/newsletter/lists/email/add.json',
          form: {
                  api_user: process.env.SENDGRID_USERNAME,
                  api_key: process.env.SENDGRID_PASSWORD,
                  list: "signups",
                  data: postData
                 }
     }
         ,function(err,httpResponse,body){

      if(err){
          console.log("Error adding new user to sendgrid list" , err);
      }

      console.log(body);

      });

}
