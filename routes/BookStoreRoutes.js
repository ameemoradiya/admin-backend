'use strict';

const express = require('express');
const router = express.Router();
const bookStoreService = require('../services/BookStoreService');
const bookStoreController = require('../controllers/BookStoreController');
const passport = require('../lib/passport/index');

// # Add book
router.post('/bookSet', [ passport ], [
  bookStoreService.bookSet,
  bookStoreController.BookData
]);

// # GetAll booklist
router.post('/getAll', [ passport ], [
  bookStoreService.getAll,
  bookStoreController.getAllBookData
]);

// # Get by Filter
router.post('/getByFilter', [ passport ], [
  bookStoreService.getFilterByPricePages,
  bookStoreController.getAllBookData
]);

// # delete book by id
router.delete('/deleteById/:bookId', [ passport ], [
  bookStoreService.deleteBookById,
  bookStoreController.deleteBookData
]);

// # delete book by name
router.delete('/deleteByName/:bname', [ passport ], [
  bookStoreService.deleteBookByName,
  bookStoreController.deleteBookData
]);

// # delete book by author
router.delete('/deleteByAuthor/:bauthorname', [ passport ], [
  bookStoreService.deleteBookByAuthor,
  bookStoreController.deleteBookData
]);

// # delete book by name & author
router.delete('/deleteByNameAuthor/:bauthorname/:bdescription', [ passport ], [
  bookStoreService.deleteBookByAuthorDesc,
  bookStoreController.deleteBookData
]);

// # delete book by name & category
router.delete('/deleteByNameCategory/:bname/:bcategory', [ passport ], [
  bookStoreService.deleteBookByNameCategory,
  bookStoreController.deleteBookData
]);

// # update book by id
router.put('/updateById/:bookId', [ passport ], [
  bookStoreService.updateBookById,
  bookStoreController.updateBookData
]);

// # update book by Name
router.put('/updateByName/:bname', [ passport ], [
  bookStoreService.updateBookByName,
  bookStoreController.updateBookData
]);

// # update book by Name & author
router.put('/updateByNameAuth/:bname/:bauthorname', [ passport ], [
  bookStoreService.updateBookByNameAuth,
  bookStoreController.updateBookData
]);

module.exports = router;
