'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Boom = require('boom');

const APP_CONSTANTS = require('../constants/AppConstants');

const BookSchema = new Schema({
  'bookId': Number,
  'bname': String,
  'bdescription': String,
  'bauthorname': String,
  'bpagenum': Number,
  'bcategory': String,
  'bprice': Number,
  'breleasyear': Number,
  'bLanguage': String
});

const BooksModel = mongoose.model(APP_CONSTANTS.TABLES.BOOK, BookSchema);

exports.findOneByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.badRequest('Invalid search details!'));
  } else if (!data.filter) {
    return callback(Boom.badRequest('Invalid filter!'));
  }

  BooksModel.findOne(data.filter).then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.insert = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid task!'));
  }
  let newBook = data.newBook;

  if (!newBook) {
    return callback(Boom.badRequest('Invalid task detail'));
  }

  let book = new BooksModel(newBook);

  book.save(function (error, result) {
    return callback(error, result);
  });

};

exports.findAllByFilter = function (data, callback) {
  
  if (!data) {
    return callback(Boom.notFound('Invalid book!'));
  }
  let BookModelQuery = BooksModel.find(data.filter);

  if (data.sort) {
    BookModelQuery.sort(data.sort);
  }
  if (data.skip) {
    BookModelQuery.skip(data.skip);
  }
  if (data.limit) {
    BookModelQuery.limit(data.limit);
  }
  if (data.select) {
    BookModelQuery._fields = data.select;
  }
  BookModelQuery.then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.countByFilter = function (data, callback) {
  if (!data) {
    return callback(Boom.notFound('Invalid book!'));
  }

  BooksModel.find(data.filter).count().then(function (result) {
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.deleteBook = function (data, callback) {
  
  if (!data.filter) {
    return callback(Boom.badRequest('Invalid book!'));
  }

  BooksModel.findOneAndRemove(data.filter).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('book not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });
};

exports.findOneAndUpdateByFilter = function (data, callback) {
  
  if (!data) {
    return callback(Boom.notFound('Invalid book!'));
  }

  BooksModel.findOneAndUpdate(data.filter, data.updatedData, data.options).then(function (result) {
    if (!result) {
      return callback(Boom.badRequest('book not found!'));
    }
    return callback(null, result);
  }).catch(function (error) {
    return callback(error);
  });

};

exports.findAllByAggregate = function (data, callback) {
  
  if (!data || !data.aggregateFilter) {
    return callback(Boom.notFound('Invalid track!'));
  }

  let BookModelQuery = BooksModel.aggregate(data.aggregateFilter);

  if (data.options) {
    BookModelQuery.options = data.options;
  }

  let queryBookStream = BookModelQuery.exec();
  let bookStore = {};

  queryBookStream.on('error', function (error) {
    return callback(error);
  });
  queryBookStream.on('data', function (result) {
    bookStore = result;
  });
  queryBookStream.on('end', function () {
    return callback(null, bookStore);
  });

};
