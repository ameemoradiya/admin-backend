'use strict';

const Boom = require('boom');

exports.registerData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('Failed to register please try again!'));
  }
  req.session.result = {
    'message': 'Registration completed successfully!'
  };
  return next();
};

exports.logInData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    req.session.result = [];
    return next();
  }
  req.session.result = userStore;
  return next();
};

exports.getCurrentUserData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('User not found!'));
  }
  req.session.result = userStore;
  return next();
};

exports.updateUserData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('Failed to update user!'));
  }
  req.session.result = {
    'message': 'User updated successfully!'
  };
  return next();
};

exports.findOneUserData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('User not found!'));
  }
  req.session.result = userStore;
  return next();
};

exports.resetUserPasswordData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('Unable to reset password!'));
  }
  req.session.result = {
    'message': 'Password reset successfully!'
  };
  return next();
};

exports.updateUserByadmnData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('Failed to update user!'));
  }
  req.session.result = {
    'message': 'User updated successfully!'
  };
  return next();
};

exports.getAllForAffiliatesTableData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    req.session.result = [];
    return next();
  }
  req.session.result = userStore;
  return next();
};

exports.deleteUserByadmnData = function (req, res, next) {
  let userStore = req.session.userStore;

  if (!userStore) {
    return next(Boom.notFound('Failed to delete user!'));
  }
  req.session.result = {
    'success': true,
    'text': 'Delete successful!'
  };
  return next();
};

exports.addProfileData = function (req, res, next) {
  let imageStore = req.session.userStore;

  if (!imageStore) {
    return next(Boom.notFound('Failed to add image!'));
  }
  req.session.result = imageStore;
  return next();
};
exports.deleteProfileData = function (req, res, next) {
  let imageDatastore = req.session.userStore;

  if (!imageDatastore) {
    return next(Boom.notFound('Failed to delete image!'));
  }
  req.session.result = imageDatastore;
  return next();
};
