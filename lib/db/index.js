'use strict';

const debug = require('debug')('Demo:AppConfig');
const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
let CONFIG_CONSTANTS = require('../../constants/ConfigConstants');


const connect = mongoose.connect(CONFIG_CONSTANTS.CONFIG.dbUrl + CONFIG_CONSTANTS.CONFIG.dbName);

connect.then(() => {
  debug('Connected correctly to server');
}, (err) => {
  debug(err);
});
