const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const firebase = require('firebase');
const createError = require('http-errors');


// Initialize Firebase
const config = {
  apiKey: "AIzaSyDZWGpCF5OQDyUxy1APre-FQNvYkR26BHw",
  authDomain: "quipu-market.firebaseapp.com",
  databaseURL: "https://quipu-market.firebaseio.com",
  projectId: "quipu-market",
  storageBucket: "quipu-market.appspot.com",
  messagingSenderId: "1006124177939"
};
firebase.initializeApp(config);
const fbRef = firebase.database().ref();

// Route Files
const routes = require('./routes/index');
const profile = require('./routes/profile');
const logout = require('./routes/logout');
const buyTokens = require('./routes/buy-tokens');
const saleTokens = require('./routes/sale-tokens');

// Init App
const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Logger
app.use(logger('dev'));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/', routes);
app.use('/profile', profile);
app.use('/buy-tokens', buyTokens);
app.use('/sale-tokens', saleTokens);
app.use('/logout', logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
