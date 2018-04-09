const express = require('express');
const path = require('path');
const app = express();
var cors = require('cors');
const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session');

const bodyParser = require('body-parser');

const AppConfig = require('./lib/AppConfig')
const index = require('./routes/index');

//Custom plugins, Don't remove it.
require('./lib/utils/lodash');

var http = require('http');
app.set(http);
//DB connection
require('./lib/db/index');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

//Handle request
app.use(session({
  secret: 'test',
  saveUninitialized: false, // don't create session until something stored,
  resave: false // don't save session if unmodified
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (request, response, next) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');  
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With, Content-Length');  
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
 });
 
 var flash = require('connect-flash');
 
 app.use(flash());
//  app.use(cors('*'));
 app.use(AppConfig.trimParams);

app.use('/', index);

// Error handling
app.use(AppConfig.handleError);
// Handle response
app.use(AppConfig.handleSuccess);
// Handle response
app.use(AppConfig.handle404);

//Catch uncaught exceptions
process.on('uncaughtException', function (error) {
  // handle the error safely
  console.log('Inside uncaughtException');
  console.log(error.stack);
  return error;
});
module.exports = app;
