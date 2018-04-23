'use strict';

const firebase = require('firebase');
const Boom = require('boom');
const CONFIG_CONSTANTS = require('../constants/ConfigConstants');

// Initialize Firebase for the application
const fb = firebase.initializeApp(CONFIG_CONSTANTS.FIREBASE_CONFIG);
const db = fb.database();
const ref = db.ref('tasks');

exports.findAll = function (callback) {
  ref.on('child_added', function (result) {
    return callback(null, result);
  }, function (error) {
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

  let task = ref.push();

  task.set(newTask).then(() => {
    return callback(null, {
      'message': 'Task added successfully!'
    });
  }).catch(function (error) {
    return callback(error);
  });

};

exports.deleteById = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  } else if (!data.id) {
    return callback(Boom.notFound('Invalid id'));
  }
  ref.child(data.id).once('value', function (snapshot) {
    if (snapshot.val()) {
      snapshot.ref.remove();
      return callback(null, {
        'message': 'Delete task successfully!'
      });
    }
    return callback(Boom.badRequest('task not found!'));
  });
};

exports.findOneAndUpdate = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  } else if (!data.id) {
    return callback(Boom.notFound('Invalid id'));
  }
  ref.child(data.id).once('value', function (snapshot) {
    if (snapshot.val()) {
      snapshot.ref.update(data.updatedData);
      return callback(null, {
        'message': 'Update task successfully!'
      });
    }
    return callback(Boom.badRequest('task not found!'));
  });
};
