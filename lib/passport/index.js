'use strict';
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const async = require('async');

const debug = require('debug')('Demo:PassportIndex');
const APP_CONSTANTS = require('../../constants/AppConstants');
const userModel = require('../../models/user');

module.exports = function (req, res, next) {
  debug('Inside passport');
  try {
    let token = req.headers.authorization;
    let decodedUserToken = {};

    debug('token %s', token);
    async.series({
      'validateToken': function (callback) {
        if (!token) {
          return callback(Boom.unauthorized('Token missing!', null));
        }
        return callback();
      },
      'decodeUserToken': function (callback) {
        jwt.verify(token, APP_CONSTANTS.JWT.KEY, function (error, decodedToken) {
          if (error) {
            return callback(error);
          } else if (!decodedToken) {
            return callback(Boom.unauthorized('Invalid token!', null));
          }
          decodedUserToken = decodedToken;
          return callback();
        });
      },
      'findUserByDecodedToken': function (callback) {
        const filter = {
          'username': decodedUserToken.u,
          'type': decodedUserToken.t,
          'status': true,
          'token': token
        };
        let select = {
          'username': 1,
          'manager': 1
        };

        userModel.findOneByFilter({
          'filter': filter,
          'select': select
        }, function (error, result) {
          if (error || !result) {
            return callback(Boom.unauthorized('Invalid token!', null));
          }
          req.body.decodedUser = result.toObject();
          return callback();

        });
      }
    }, function (error) {
      if (error) {
        return next(error);
      }
      return next();
    });
  } catch (error) {
    debug('error %o', error);
    return next(error);
  }
};
