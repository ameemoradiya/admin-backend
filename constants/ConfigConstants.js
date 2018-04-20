'use strict';

const ENVIRONMENT = require('./Environment');
let CONFIG = {};
let nodeEnv = ENVIRONMENT.ENV;

if (nodeEnv === 'local') {
  CONFIG = {
    'nodeEnv': 'local',
    'uiUrl': 'http://localhost:8000',
    'dbUrl': 'mongodb://localhost:27017/',
    'dbName': 'testDB',
    'option': {
      'server': {
        'reconnectTries': 5000,
        'reconnectInterval': 0,
        'socketOptions': {
          'socketTimeoutMS': 100000,
          'connectTimeoutMS': 100000
        }
      }
    }
  };
}
exports.CONFIG = CONFIG;
