var Boom = require('boom');
var _ = require('lodash');

exports.BookData = function (req, res, next) {
  var bookStore = req.session.bookStore;
  if (!bookStore) {
    return next(new Boom.notFound('Failed to add book please try again!'));
  }
  req.session.result = {
    message: 'Book added successfully!'
  };
  return next();
};

exports.getAllBookData = function (req, res, next) {
  var bookStore = req.session.bookStore;
  if (!bookStore) {
    return next(new Boom.notFound('Book not found!'));
  }
  req.session.result = bookStore;
  return next();
};

exports.deleteBookData = function (req, res, next) {
  var bookStore = req.session.bookStore;
  if (!bookStore) {
    return next(new Boom.notFound('Failed to delete book!'));
  }
  req.session.result = {success: true, text: 'Delete successful!'};
  return next();
};

exports.updateBookData = function(req, res, next){
  var bookStore = req.session.bookStore;
  if (!bookStore) {
    return next(new Boom.notFound('Failed to update book!'));
  }
  req.session.result = bookStore;
  return next();
};