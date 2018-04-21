'use strict';

const _ = require('lodash');
const debug = require('debug')('Demo:FirebaseTaskService');
const firebase = require('firebase');
const Boom = require('boom');
const APP_CONSTANTS = require('../constants/AppConstants');

// Initialize Firebase for the application
const fb = firebase.initializeApp(APP_CONSTANTS.FIREBASE_CONFIG);
const db = fb.database();
const ref = db.ref('tasks');

// add task
exports.getAll = function (req, res, next) {
  debug('inside getAll firebasetaskservice');
  try {
    let response = [];
    let resKey = [];
    let merge;

    ref.on('child_added', function (snapshot) {
      response.push(snapshot.val());
      resKey.push({
        'key': snapshot.key
      });
      merge = _.merge(response, resKey);
      req.session.fbTaskStore = merge;
      return next();
    }, function (errorObject) {
      return next(Boom.badRequest(errorObject.code));
    });

  } catch (error) {
    return next(error);
  }
};

exports.delete = function (req, res, next) {
  debug('inside delete firebasetaskservice');
  let params = req.params;

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid task!'), null);
    } else if (!params.key) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    ref.child(req.params.key).remove(function (error) {
      if (error) {
        return next(Boom.badRequest('Unable to delete task!'));
      } else {
        req.session.fbTaskStore = [ {
          'deleteKey': req.params.key
        } ];
        return next();
      }
    });

  } catch (error) {
    return next(error);
  }
};

exports.taskset = function (req, res, next) {
  debug('inside taskset firebasetaskservice');
  let params = req.body;

  try {
    let set = {
      'clientname': params.clientname,
      'content': params.content,
      'done': params.done
    };

    let addData = {
      'set': _.compactObject(set)
    };

    ref.push().set(addData.set).then((error) => {
      if (error) {
        return next(Boom.badRequest(error), null);
      }
    });
    req.session.fbTaskStore = [ addData.set ];
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.updateTask = function (req, res, next) {
  debug('inside updateTask firebasetaskservice');
  let params = _.merge(req.body, req.params);
  let updatedData;
  let set;

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid task!'), null);
    } else if (!params.key) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    set = {
      'clientname': params.clientname,
      'content': params.content,
      'done': params.done
    };
    updatedData = {
      'set': _.compactObject(set)
    };
    ref.child(params.key).update(updatedData.set);

    req.session.fbTaskStore = [ {
      'updateTask': req.params.key
    } ];
    return next();

  } catch (error) {
    return next(error);
  }
};
