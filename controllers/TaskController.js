'use strict';

const Boom = require('boom');

exports.getAllTaskData = function (req, res, next) {
  let taskStore = req.session.taskStore;
    
  if (!taskStore) {
    return next(Boom.notFound('Task not found!'));
  }
  req.session.result = taskStore;
  return next();
};

exports.updateTaskData = function (req, res, next) {
  let taskStore = req.session.taskStore;
    
  if (!taskStore) {
    return next(Boom.notFound('Failed to update task!'));
  }
  req.session.result = taskStore;
  return next();
};

exports.deleteTaskData = function (req, res, next) {
  let taskStore = req.session.taskStore;
    
  if (!taskStore) {
    return next(Boom.notFound('Failed to delete task!'));
  }
  req.session.result = {
    'success': true,
    'text': 'Delete successful!'
  };
  return next();
};

exports.TaskData = function (req, res, next) {
  let taskStore = req.session.taskStore;

  if (!taskStore) {
    return next(Boom.notFound('Failed to add task please try again!'));
  }
  req.session.result = {
    'message': 'Task added successfully!'
  };
  return next();
};
