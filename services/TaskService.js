'use strict';

const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const debug = require('debug')('Demo:TaskService');
const Boom = require('boom');

const taskModel = require('../models/task');

// add task
exports.findTaskByTaskname = function (req, res, next) {
  debug('inside findTaskByTaskname');
  try {
    let params = _.merge(req.body, req.query);
    let tempFilter = [];

    tempFilter.push({
      'taskName': {
        '$regex': new RegExp(`^ ${params.taskName} $, i`)
      }
    });
    let filter = {
      '$or': tempFilter
    };

    taskModel.findOneByFilter({
      'filter': filter
    }, function (error, result) {

      if (error) {
        return next(error);
      }
      if (result) {
        return next(Boom.badRequest('Task already inserted!'));
      }
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

exports.taskSet = function (req, res, next) {
  debug('inside taskset');
  try {
    let params = _.merge(req.body, req.query);
    let newTask = params;

    newTask.isComplete = params.isComplete;
    newTask.taskName = params.taskName;
    newTask.content = params.content;
    taskModel.insert({
      'newTask': newTask
    }, function (error, result) {
      if (error || !result) {
        return next(Boom.badRequest('Could not add task please try again!'));
      }
      req.session.taskStore = result;
      return next();
    });


  } catch (error) {
    return next(error);
  }
};

// # getAllTasks
exports.getAll = function (req, res, next) {
  let params = req.body;
  let responseData = {
    'recordsTotal': 0,
    'data': [],
    'success': true,
    'error': ''
  };

  try {
    let pageNo = parseInt(params.pagenumber, 10);
    let size = parseInt(params.perpage, 10);
    let sortCol = params.sortColumn;
    let sortType = params.sortType;
    let query = {};
    let searchQuery = {};
    let skip = pageNo > 0 ? ((pageNo - 1) * size) : 0;

    query.sort = {};
    query.sort[sortCol] = sortType;
    
    if (params.search) {
      searchQuery = {
        'content': {
          '$regex': params.search
        }
      };
    }

    // Database query
    async.series({
      'getAllTask': function (innerCallback) {
        taskModel.findAllByFilter({
          'filter': searchQuery,
          'limit': size,
          'skip': skip,
          'sort': query.sort
        }, function (error, result) {
          if (error) {
            return innerCallback(error);
          }
          responseData.data = result;
          return innerCallback();
        });

      },

      'totalCount': function (innerCallback) {
        taskModel.countByFilter({
          'filter': searchQuery
        }, function (error, count) {
          if (error) {
            return innerCallback(error);
          }
          responseData.recordsTotal = count;
          return innerCallback();
        });

      }
    }, function (error) {
      if (error) {
        debug('error :%o ', error);
        return next(error);
      }
      req.session.taskStore = responseData;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

// # updateTask
exports.validateUpdateTask = function (req, res, next) {
  let params = req.body;

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid Task!'), null);
    } else if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return next(Boom.badRequest('Invalid id!'), null);
    } else if (!params.taskName) {
      return next(Boom.badRequest('Invalid task name!'), null);
    }
    let filter = {
      'taskName': params.taskName
    };

    taskModel.findOneByFilter({
      'filter': filter
    }, function (error, result) {
      if (error) {
        return next(error);
      } else if (result) {
        return next(Boom.conflict('New task you are try to update is already exist!'));
      }
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }

};
exports.updateTask = function (req, res, next) {
  let params = req.body;

  try {
    let set = {
      'isComplete': req.body.isComplete,
      'taskName': req.body.taskName,
      'content': req.body.content
    };

    let filter = {
      '_id': mongoose.Types.ObjectId(params.id)
    };
    let updatedData = {
      '$set': set
    };
    let options = {
      'new': true,
      'runValidators': true
    };

    taskModel.findOneAndUpdateByFilter({
      'filter': filter,
      'updatedData': updatedData,
      'options': options
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.taskStore = result;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }

};

// # deleteTask
exports.deleteTask = function (req, res, next) {
  try {
    let params = _.merge(req.params, req.body);

    debug('params', params);

    if (!params) {
      return next(Boom.badRequest('Invalid task!'), null);
    } else if (!params.taskId || !mongoose.Types.ObjectId.isValid(params.taskId)) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    taskModel.deleteById({
      'id': params.taskId
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.taskStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};


// # taskComplete update Task
exports.validateCompleteTask = function (req, res, next) {
  let params = req.body;

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid Task!'), null);
    } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
      return next(Boom.badRequest('Invalid id!'), null);
    } else if (!params.taskName) {
      return next(Boom.badRequest('Invalid task name!'), null);
    }
    let filter = {
      '_id': params.taskId
    };

    taskModel.findOneByFilter({
      'filter': filter
    }, function (error, result) {
      if (error) {
        return next(error);
      } else if (result) {
        return next(Boom.conflict('New task you are try to update is already exist!'));
      }
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

exports.taskComplete = function (req, res, next) {
  let params = req.body;

  try {
    let set = {
      'isComplete': req.body.isComplete
    };

    let filter = {
      '_id': mongoose.Types.ObjectId(params._id)
    };
    let updatedData = {
      '$set': set
    };
    let options = {
      'new': true,
      'runValidators': true
    };

    taskModel.findOneAndUpdateByFilter({
      'filter': filter,
      'updatedData': updatedData,
      'options': options
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.taskStore = result;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};
