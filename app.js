'use strict';

const debug = require('debug')('Demo:App');
const express = require('express');
const path = require('path');
const app = express();
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const AppConfig = require('./lib/AppConfig');
const index = require('./routes/index');
const adminRoutes = require('./routes/admin/index');
const firebaseIndex = require('./routes/firebaseTask/index');


// Custom plugins, Don't remove it.
require('./lib/utils/lodash');

const http = require('http');

app.set(http);
// DB connection
require('./lib/db/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));

// Handle request
app.use(session({
  'secret': 'test',
  'saveUninitialized': false,
  'resave': false
}));

app.use(bodyParser.urlencoded({
  'extended': true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public/assets/')));

app.use(function (request, response, next) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, enctype, X-Requested-With, Content-Length');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(AppConfig.trimParams);

app.use('/', index);

// # UserRoutes Route
app.use('/admin', adminRoutes);

// # FirebaseRoutes Route
app.use('/', firebaseIndex);

// Error handling
app.use(AppConfig.handleError);
// Handle response
app.use(AppConfig.handleSuccess);
// Handle response
app.use(AppConfig.handle404);

// Catch uncaught exceptions
process.on('uncaughtException', function (error) {
  // handle the error safely
  debug('Inside uncaughtException');
  debug(error.stack);
  return error;
});
module.exports = app;
