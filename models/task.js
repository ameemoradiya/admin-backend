'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Boom = require('boom');
const APP_CONSTANTS = require('../constants/AppConstants');

const TaskSchema = new Schema({
  'taskName': String,
  'content': String,
  'isComplete': false
});

const TasksModel = mongoose.model(APP_CONSTANTS.TABLES.TASK, TaskSchema);

exports.findAllByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  }
  let TaskModelQuery = TasksModel.find(data.filter);

  if (data.sort) {
    TaskModelQuery.sort(data.sort);
  }
  if (data.skip) {
    TaskModelQuery.skip(data.skip);
  }
  if (data.limit) {
    TaskModelQuery.limit(data.limit);
  }
  if (data.select) {
    TaskModelQuery._fields = data.select;
  }
  TaskModelQuery.then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.countByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  }

  TasksModel.find(data.filter).count().then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.findOneByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.badRequest('Invalid search details!'));
  } else if (!data.filter) {
    return callback(Boom.badRequest('Invalid filter!'));
  }

  TasksModel.findOne(data.filter).then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.findOneAndUpdateByFilter = function (data, callback) {

  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  }

  TasksModel.findOneAndUpdate(data.filter, data.updatedData, data.options).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('task not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });

};

exports.deleteById = function (data, callback) {
  if (!data) {
    return callback(Boom.badRequest('Invalid task!'));
  } else if (!data.id) {
    return callback(Boom.badRequest('Invalid id'));
  }

  let query = {
    '_id': data.id
  };

  TasksModel.findOneAndRemove(query).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('Task not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.insert = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  }
  let newTask = data.newTask;

  if (!newTask) {
    return callback(Boom.badRequest('Invalid task detail'));
  }

  let task = new TasksModel(newTask);

  task.save(function (error, result) {
    return callback(error, result);
  });

};
