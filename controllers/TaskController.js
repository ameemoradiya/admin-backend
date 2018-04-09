// 'use strict';

//var debug = require('debug')('Javandi:PublisherCategoryController');
var Boom = require('boom');
var _ = require('lodash');

exports.getAllTaskData = function (req, res, next) {
  var taskStore = req.session.taskStore;
  if (!taskStore) {
    return next(new Boom.notFound('Task not found!'));
  }
  req.session.result = taskStore;
  return next();
};

exports.updateTaskData = function(req, res, next){
  var taskStore = req.session.taskStore;
  if (!taskStore) {
    return next(new Boom.notFound('Failed to update task!'));
  }
  req.session.result = taskStore;
  return next();
};

exports.deleteTaskData = function (req, res, next) {
  var taskStore = req.session.taskStore;
  if (!taskStore) {
    return next(new Boom.notFound('Failed to delete task!'));
  }
  req.session.result = {success: true, text: 'Delete successful!'};
  return next();
};

exports.TaskData = function (req, res, next) {
  var taskStore = req.session.taskStore;
  if (!taskStore) {
    return next(new Boom.notFound('Failed to add task please try again!'));
  }
  req.session.result = {message: 'Task added successfully!'};
  return next();
};