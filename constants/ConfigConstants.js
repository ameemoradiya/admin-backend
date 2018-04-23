'use strict';

const ENVIRONMENT = require('./Environment');
let CONFIG = {};
let FIREBASE_CONFIG = {};
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
  FIREBASE_CONFIG = {
    'apiKey': 'AIzaSyCYehaEwopAUrV4uu2U-dwyp_ySWjmwE1w',
    'authDomain': 'ang5firebase-5c128.firebaseapp.com',
    'databaseURL': 'https://ang5firebase-5c128.firebaseio.com',
    'storageBucket': 'ang5firebase-5c128.appspot.com',
    'messagingSenderId': '19801560327'
  };
}
exports.CONFIG = CONFIG;
exports.FIREBASE_CONFIG = FIREBASE_CONFIG;
