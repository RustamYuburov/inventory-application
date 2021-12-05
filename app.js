var createError = require('http-errors');
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var compression = require('compression');
var helmet = require('helmet');

var app = express();
app.use(compression()); //Compress all routes
app.use(helmet());
app.use(favicon(path.join(__dirname, 'public', 'images', 'site-favicon.ico')));

const mongoose = require('mongoose');
const dev_db_url =
  'mongodb+srv://magma:inventory1234app@clusterinventory.45gwj.mongodb.net/inventory_application?retryWrites=true&w=majority';
const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.use(expressLayouts);
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views/genre/'),
  path.join(__dirname, 'views/game/'),
  path.join(__dirname, 'views/developer/'),
  path.join(__dirname, 'views/partials/'),
]);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
