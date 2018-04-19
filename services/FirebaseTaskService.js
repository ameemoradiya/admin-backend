'use strict';

const _ = require('lodash');
const debug = require('debug')('Demo:TaskService');
const firebase = require('firebase');
const Boom = require('boom');

// Initialize Firebase for the application
var config = {
  apiKey: 'AIzaSyCYehaEwopAUrV4uu2U-dwyp_ySWjmwE1w',
  authDomain: 'ang5firebase-5c128.firebaseapp.com',
  databaseURL: 'https://ang5firebase-5c128.firebaseio.com',
  storageBucket: 'ang5firebase-5c128.appspot.com',
  messagingSenderId: '19801560327'
};
const fb = firebase.initializeApp(config);
const db = fb.database();
var ref = db.ref('tasks');

//add task
exports.getAll = function (req, res, next) {
  debug('inside getAll service');

  try {
    let response = [];
    let resKey = [];
    ref.on('child_added', function (snapshot) {
      response.push(snapshot.val());
      resKey.push({
        key: snapshot.key
      });
      let merge = _.merge(response, resKey);
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
  debug('inside delete service');
  let params = req.params;

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid task!'), null);
    } else if (!params.key) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    ref.child('tasks').child(req.params.key).remove(function(error){
      if (error) {
        return next(Boom.badRequest('Unable to delete task!'));
      } else {
        req.session.fbTaskStore = [{
          deleteKey: req.params.key
        }];
        return next();
      }
    });

  } catch (error) {
    return next(error);
  }
};

exports.taskset = function (req, res, next) {
  debug('inside taskset service');
  let params = req.body;
  try {
    let set = {
      clientname: params.clientname,
      content: params.content,
      done: params.done
    };

    let addData = {
      set: _.compactObject(set)
    };

    ref.push().set(addData.set).then((error) => {
      if (error) {
        return next(Boom.badRequest(error), null);
      }
    });
    req.session.fbTaskStore = [addData.set];
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.updateTask = function (req, res, next) {
  debug('inside updateTask service');
  let params = _.merge(req.body, req.params);

  try {
    if (!params) {
      return next(Boom.badRequest('Invalid task!'), null);
    } else if (!params.key) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    let set = {
      clientname: params.clientname,
      content: params.content,
      done: params.done
    };
    let updatedData = {
      set: _.compactObject(set)
    };
    ref.child(params.key).update(updatedData.set);

    req.session.fbTaskStore = [{
      updateTask: req.params.key
    }];
    return next();

  } catch (error) {
    return next(error);
  }
};