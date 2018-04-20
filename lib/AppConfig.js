'use strict';

const debug = require('debug')('Demo:AppConfig');
const _ = require('lodash');
const Boom = require('boom');

exports.trimParams = function (req, res, next) {
  //   debug('API : %o', utils.url(req) + req.url);
  // Trim query and post parameters
  _.each(req.body, function (value, key) {
    if ((_.isString(value) && !_.isEmpty(value))) {
      req.body[key] = value.trim();
    }
  });

  _.each(req.query, function (value, key) {
    if ((_.isString(value) && !_.isEmpty(value))) {
      req.query[key] = value.trim();
    }
  });
  debug('req.method : %s ', req.method);
  debug('req.body : %o ', req.body);
  debug('req.query : %o ', req.query);

  next();
};

exports.handleSuccess = function (req, res, next) {
  if (!req.session.result) {
    debug('Return from undefined req.session.result ');
    return next();
  }
  let resObject = req.session.result || [];

  req.session.destroy();

  debug('Success response :: ');
  // debug(resObject);
  debug('----------------------------------------------------------------------------------- ');
  return res.json(resObject);
};

exports.handle404 = function (req, res, next) {
  debug('Return from handle404');
  let api = /v1/;

  if (api.test(req.path) === true) {
    return next(Boom.notFound(`Invalid request ${req.url}`));
    // res.status(404).send('Invalid request ' + utils.url(req) + req.url);
  }
  return next();
};

exports.handleError = function (err, req, res, next) {
  if (!err) {
    return next();
  }
  let errorResponse = {
    'error': _.merge({
      'stack': err.stack
    }, err.output && err.output.payload ? err.output.payload : err)
  };

  debug('Error stack :: ');
  debug(err.stack);
  debug('----------------------------------------------------------------------------------- ');
  return res.status(err.output && err.output.statusCode ? err.output.statusCode : 500).json(errorResponse);
};
