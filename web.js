// required packages  ==========================================================
var express = require('express');
var enforce = require('express-sslify');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var url = require('url');
var morgan = require('morgan');

// configure mongo =============================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

mongoose.connection.on('open', function() {
  console.log("Connected to Mongoose...");
});

// configure express ===========================================================
var app = express();

app.use(morgan('dev')); // log every request to the console
app.set('port', process.env.PORT || 8000);
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'secret kitty',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    resave: true,
    saveUninitialized: true
    // secureProxy: false // if you do SSL outside of node
}));

// configure express template engine ===========================================
app.set('views', __dirname + '/views');
app.engine('.html', exphbs({defaultLayout: 'main', extname: '.html'}));
app.set('view engine', 'html');

// routes ======================================================================

// load our routes and pass in our app
require('./routes')(app);


var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
