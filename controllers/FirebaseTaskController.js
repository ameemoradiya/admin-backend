'use strict';

const Boom = require('boom');

exports.fbTaskData = function (req, res, next) {
  let taskDataStore = req.session.fbTaskStore;
  
  if (!taskDataStore) {
    return next(Boom.notFound('Failed to get all task please try again!'));
  }
  req.session.result = taskDataStore;
  return next();
};

exports.addedTaskData = function (req, res, next) {
  let taskStore = req.session.fbTaskStore;

  if (!taskStore) {
    return next(Boom.notFound('Failed to add task please try again!'));
  }
  req.session.result = {
    'message': 'Task added successfully!'
  };
  return next();
};

exports.updatefbTaskData = function (req, res, next) {
  let taskDataStore = req.session.fbTaskStore;

  if (!taskDataStore) {
    return next(Boom.notFound('Failed to update task please try again!'));
  }
  req.session.result = {
    'success': true,
    'text': 'Update successful!'
  };
  return next();
};

exports.deletefbTaskData = function (req, res, next) {
  let taskDataStore = req.session.fbTaskStore;

  if (!taskDataStore) {
    return next(Boom.notFound('Failed to delete task please try again!'));
  }
  req.session.result = {
    'success': true,
    'text': 'Delete successful!'
  };
  return next();
};
