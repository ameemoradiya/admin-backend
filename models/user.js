'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validate = require('mongoose-validator');
const md5 = require('md5');
const Boom = require('boom');
const APP_CONSTANTS = require('../constants/AppConstants');


const usernameV = [
  validate({
    'validator': 'isLength',
    'arguments': [ 2, 40 ],
    'message': 'The Username should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

const emailV = [
  validate({
    'validator': 'isEmail',
    'message': 'The Email is invalid'
  })
];

let usersSchema = new Schema({
  'fullname': {
    'required': false,
    'type': String
  },
  'username': {
    'index': {
      'unique': true
    },
    'type': String,
    'required': true,
    'validate': usernameV
  },
  'email': {
    'index': {
      'unique': true
    },
    'type': String,
    'validate': emailV
  },
  'company': {
    'type': String,
    'required': false
  },
  'phone': {
    'type': String,
    'required': false
  },
  'address': {
    'type': String,
    'required': false
  },
  'city': {
    'type': String,
    'required': false
  },
  'zip': {
    'type': String,
    'required': false
  },
  'password': {
    'type': String
  },
  'passwordClear': {
    'type': String
  },
  'moreInfo': {
    'type': String,
    'required': false
  },
  'status': {
    'type': Boolean
  },
  'token': {
    'type': String
  },
  'type': {
    'type': String
  },
  'uploadImgName': {
    'type': String
  }
});

function isValidMd5 (pass) {
  let regExp = /^[A-Za-z0-9]{32}$/;

  return (pass.match(regExp));
}

function setPassword (v) {
  let validMD5 = isValidMd5(v);

  if (!validMD5 && (v.length < 8 || v.length > 20)) {
    return 'error';
  } else {
    if (validMD5) {
      return v;
    }
  }
  return md5(v);
}

usersSchema.path('password').set(function (v) {
  let pass = setPassword(v);

  if (pass === 'error') {
    this.invalidate('name', 'The Password should be between 8 and 20 characters');
  } else {
    return pass;
  }
});

let UsersModel = mongoose.model(APP_CONSTANTS.TABLES.USERS, usersSchema);

exports.findOneByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.badRequest('Invalid search details'));
  } else if (!data.filter) {
    return callback(Boom.badRequest('Invalid filter'));
  }

  let usersModelQuery = UsersModel.findOne(data.filter);

  if (data.select) {
    usersModelQuery._fields = data.select;
  }
  usersModelQuery.then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.insert = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid user!'));
  }
  let newUser = data.newUser;

  if (!newUser) {
    return callback(Boom.badRequest('Invalid user detail'));
  }

  let user = new UsersModel(newUser);

  user.save(function (error, result) {
    return callback(error, result);
  });

};

exports.findOneAndUpdateByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid user!'));
  }
  UsersModel.findOneAndUpdate(data.filter, data.updatedData, data.options).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('User not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });

};

exports.findAllByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid user!'));
  }
  let usersModelQuery = UsersModel.find(data.filter);
  
  if (data.sort) {
    usersModelQuery.sort(data.sort);
  }
  if (!data.skip) {
    usersModelQuery.skip(data.skip);
  }
  if (!data.limit) {
    usersModelQuery.limit(data.limit);
  }
  if (data.select) {
    usersModelQuery._fields = data.select;
  }
  usersModelQuery.then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.countByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid user!'));
  }
  UsersModel.find(data.filter).count().then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.deleteById = function (data, callback) {
  if (!data) {
    return callback(Boom.badRequest('Invalid User!'));
  } else if (!data.id) {
    return callback(Boom.badRequest('Invalid id'));
  }
  let query = {
    '_id': data.id
  };
  
  UsersModel.findOneAndRemove(query).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('User not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};
