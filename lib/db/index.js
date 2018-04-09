const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var CONFIG_CONSTANTS = require('../../constants/ConfigConstants');


const connect = mongoose.connect(CONFIG_CONSTANTS.CONFIG.dbUrl + CONFIG_CONSTANTS.CONFIG.dbName);

connect.then((db) => {
  console.log('Connected correctly to server');
}, (err) => { console.log(err); });
