'use strict';
const jwt = require('jsonwebtoken');
const Boom = require('boom');
// const async = require('async');

const debug = require('debug')('Demo:PassportIndex');
const APP_CONSTANTS = require('../../constants/AppConstants');
const userModel = require('../../models/user');

async function decodeUserToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, APP_CONSTANTS.JWT.KEY, function (error, decodedToken) {
      if (error) {
        reject(error);
      } else if (!decodedToken) {
        reject(Boom.unauthorized('Invalid token!', null));
      }
      resolve(decodedToken);
    });
  });
}
async function findUserByDecodedToken (data) {
  return new Promise((resolve, reject) => {
    userModel.findOneByFilter(data, function (error, result) {
      if (error || !result) {
        reject(Boom.unauthorized('Invalid token!', null));
      }
      resolve(result.toObject());
      

    });
  });
}
module.exports = async function (req, res, next) {
  debug('Inside passport');
  try {
    let token = req.headers.authorization;
    let decodedUserToken = {};

    debug('token %s', token);
    if (!token) {
      return next(Boom.unauthorized('Token missing!', null));
    }

    decodedUserToken = await decodeUserToken(token);

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
    let data = {
      'filter': filter,
      'select': select
    };

    req.body.decodedUser = await findUserByDecodedToken(data);
    return next();
  } catch (error) {
    debug('error %o', error);
    return next(error);
  }
};
