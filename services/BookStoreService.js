'use strict';

const _ = require('lodash');
const async = require('async');
const debug = require('debug')('Demo:BookStoreService');
const Boom = require('boom');
const bookStoreModel = require('../models/bookstore');

// add book
exports.bookSet = function (req, res, next) {
  debug('Inside bookSet service.');

  try {
    let params = _.merge(req.body, req.query);
    let bookStore = {};

    async.series({
      'findBookByBookname': function (callback) {
        let tempFilter = [];

        tempFilter.push({
          'bookId': params.bookId
        });
        tempFilter.push({
          'bname': { '$regex': new RegExp(`^' ${params.bname} $, i`) }
        });
        let filter = {
          '$or': tempFilter
        };
        
        bookStoreModel.findOneByFilter({
          'filter': filter
        }, function (error, result) {
          if (error) {
            return callback(error);
          }
          if (result) {
            return callback(Boom.badRequest('Bookid or Bookname already inserted!'));
          }
          return callback();
        });
      },
      'addBook': function (callback) {
        let newBook = params;
        
        newBook.bookId = params.bookId;
        newBook.bname = params.bname;
        newBook.bdescription = params.bdescription;
        newBook.bpagenum = params.bpagenum;
        bookStoreModel.insert({
          'newBook': newBook
        }, function (error, result) {
          if (error || !result) {
            return callback(Boom.badRequest('Could not add book please try again!'));
          }
          bookStore = result;
          return callback();
        });
      }
    }, function (error) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = bookStore;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # getAllTasks
exports.getAll = function (req, res, next) {
  debug('Inside getAll service.');

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

    query.sort = {};
    if (params.sortColumn) {
      query.sort[sortCol] = sortType;
    }
    if (params.showbypage) {
      searchQuery = {
        'bpagenum': { '$gt': params.showbypage } };
    }
    if (params.gpage && params.lpage) {
      searchQuery = {
        'bpagenum': { '$gt': params.gpage, '$lt': params.lpage } };
    }
    if (params.gpage && params.lpage && params.notequal) {
      searchQuery = {
        'bpagenum': { '$gt': params.gpage, '$lt': params.lpage, '$ne': params.notequal } };
    }
    if (params.showbyname) {
      searchQuery = { 'bname': params.showbyname };
    }
    if (params.showbyid) {
      searchQuery = { 'bookId': params.showbyid };
    }
    if (params.search) {
      searchQuery = { 'bname': { '$regex': params.search } };
    }
    if (params.showbyyear) {
      searchQuery = { 'breleasyear': params.showbyyear };
    }
    if (params.bpagesize === 0) {
      searchQuery = { 'bpagenum': params.bpagesize };
    }
    if (params.yr1 && params.yr15) {
      searchQuery = { 'breleasyear': { '$in': [ params.yr1, params.yr15 ] } };
    }
    if (params.bLanguage) {
      searchQuery = { 'bLanguage': { '$ne': null } };
    }
    
    // Database query
    async.series({
      'getAllBook': function (innerCallback) {
        bookStoreModel.findAllByFilter({
          'filter': searchQuery,
          'limit': size || null,
          'skip': pageNo > 0 ? ((pageNo - 1) * size) : 0 || null,
          'sort': query.sort || null
        }, function (error, result) {
          if (error) {
            return innerCallback(error);
          }
          responseData.data = result;
          return innerCallback();
        });
      },
      'totalCount': function (innerCallback) {
        bookStoreModel.countByFilter({
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
      req.session.bookStore = responseData;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

// # deleteBook by id
exports.deleteBookById = function (req, res, next) {
  debug('Inside deleteBookById service.');

  try {
    let params = _.merge(req.params, req.body);

    if (!params) {
      return next(Boom.badRequest('Invalid book!'), null);
    } else if (!params.bookId) {
      return next(Boom.badRequest('Invalid id!'), null);
    }
    let query = {
      'bookId': params.bookId
    };

    bookStoreModel.deleteBook({
      'filter': query
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # deleteBook by name
exports.deleteBookByName = function (req, res, next) {
  debug('Inside deleteBookByName service.');

  try {
    let params = _.merge(req.params, req.body);

    if (!params) {
      return next(Boom.badRequest('Invalid book!'), null);
    } else if (!params.bname) {
      return next(Boom.badRequest('Invalid bookname!'), null);
    }

    let query = {
      'bname': params.bname
    };
    
    bookStoreModel.deleteBook({
      'filter': query
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # deleteBook by author
exports.deleteBookByAuthor = function (req, res, next) {
  debug('Inside deleteBookByAuthor service.');

  try {
    let params = _.merge(req.params, req.body);

    if (!params) {
      return next(Boom.badRequest('Invalid book!'), null);
    } else if (!params.bauthorname) {
      return next(Boom.badRequest('Invalid bookauthor!'), null);
    }
    let query = {
      'bauthorname': params.bauthorname
    };

    bookStoreModel.deleteBook({
      'filter': query
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # deleteBook by author & description
exports.deleteBookByAuthorDesc = function (req, res, next) {
  debug('Inside deleteBookByAuthorDesc service.');

  try {
    let params = _.merge(req.params, req.body);

    if (!params) {
      return next(Boom.badRequest('Invalid book!'), null);
    } else if (!params.bauthorname) {
      return next(Boom.badRequest('Invalid bookauthor!'), null);
    } else if (!params.bdescription) {
      return next(Boom.badRequest('Invalid book description!'), null);
    }
    let query = {
      'bauthorname': params.bauthorname,
      'bdescription': params.bdescription
    };
    
    bookStoreModel.deleteBook({
      'filter': query
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # deleteBook by name & category
exports.deleteBookByNameCategory = function (req, res, next) {
  debug('Inside deleteBookByNameCategory service.');

  try {
    let params = _.merge(req.params, req.body);

    if (!params) {
      return next(Boom.badRequest('Invalid book!'), null);
    } else if (!params.bname) {
      return next(Boom.badRequest('Invalid book name!'), null);
    } else if (!params.bcategory) {
      return next(Boom.badRequest('Invalid book category!'), null);
    }
    let query = {
      'bname': params.bname,
      'bcategory': params.bcategory
    };
    
    bookStoreModel.deleteBook({
      'filter': query
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

// # updateBook by Id
exports.updateBookById = function (req, res, next) {
  debug('Inside updateBookById service.');
  let param = req.body;
  let updatedBook = {};

  try {
    async.series({
      'validateUpdateBook': function (callback) {
        if (!param) {
          return callback(Boom.badRequest('Invalid Book!'), null);
        } else if (!param.bookId) {
          return callback(Boom.badRequest('Invalid id!'), null);
        } else if (!param.bname) {
          return callback(Boom.badRequest('Invalid book name!'), null);
        }
        let filter = {
          'bname': param.bname
        };
        
        bookStoreModel.findOneByFilter({
          'filter': filter
        }, function (error, result) {
          if (error) {
            return callback(error);
          } else if (result) {
            return callback(Boom.conflict('New book you are try to update is already exist!'));
          }
          return callback();
        });
      },
      'updateTaskById': function (callback) {
        let params = param;
        let filter = {
          'bookId': param.bookId
        };
        let updatedData = {
          '$set': params
        };
        let options = {
          'new': true,
          'runValidators': true
        };
        
        bookStoreModel.findOneAndUpdateByFilter({
          'filter': filter,
          'updatedData': updatedData,
          'options': options
        }, function (error, result) {
          if (error) {
            return callback(error);
          }
          updatedBook = result;
          return callback();
        });
      }
    }, function (error) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = updatedBook;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

// # updateBook by name
exports.updateBookByName = function (req, res, next) {
  debug('Inside updateBookByName service.');
  let param = req.body;

  try {
    if (!param) {
      return next(Boom.badRequest('Invalid Book!'), null);
    } else if (!param.bname) {
      return next(Boom.badRequest('Invalid book name!'), null);
    }

    let set = {
      'bname': param.bname,
      'bdescription': param.bdescription,
      'bauthorname': param.bauthorname,
      'bpagenum': param.bpagenum,
      'bcategory': param.bcategory,
      'bprice': param.bprice,
      'breleasyear': param.breleasyear,
      'bLanguage': param.bLanguage
    };
    
    set = _.compactObject(set);
    let filter = {
      'bname': param.bname
    };
    let updatedData = {
      '$set': set
    };
    let options = {
      'new': true,
      'runValidators': true
    };
    
    bookStoreModel.findOneAndUpdateByFilter({
      'filter': filter,
      'updatedData': updatedData,
      'options': options
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

// # updateBook by name & author
exports.updateBookByNameAuth = function (req, res, next) {
  debug('Inside updateBookByNameAuth service.');
  let param = req.body;

  try {
    if (!param) {
      return next(Boom.badRequest('Invalid Book!'), null);
    } else if (!param.bname) {
      return next(Boom.badRequest('Invalid book name!'), null);
    } else if (!param.bauthorname) {
      return next(Boom.badRequest('Invalid book author!'), null);
    }
    let set = {
      'bname': param.bname,
      'bdescription': param.bdescription,
      'bauthorname': param.bauthorname,
      'bpagenum': param.bpagenum,
      'bcategory': param.bcategory,
      'bprice': param.bprice,
      'breleasyear': param.breleasyear,
      'bLanguage': param.bLanguage
    };
    
    set = _.compactObject(set);
    let filter = {
      'bname': param.bname,
      'bauthorname': param.bauthorname
    };
    let updatedData = {
      '$set': set
    };
    let options = {
      'new': true,
      'runValidators': true
    };
    
    bookStoreModel.findOneAndUpdateByFilter({
      'filter': filter,
      'updatedData': updatedData,
      'options': options
    }, function (error, result) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = result;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};

// # get by Filter with Price & Pages
exports.getFilterByPricePages = function (req, res, next) {
  debug('Inside getFilterByPricePages service.');
  let bookStore;
  let responseData = {
    'data': ''
  };

  try {
    let aggregateFilter = [ {
      '$group': {
        '_id': null,
        'bprice': {
          '$max': '$bprice'
        },
        'bpagenum': {
          '$min': '$bpagenum'
        }
      }
    } ];
    let options = {
      'allowDiskUse': true,
      'cursor': {
        'batchSize': 1500000
      }
    };
    
    async.series({
      'filterData': function (callback) {
        bookStoreModel.findAllByAggregate({
          'aggregateFilter': aggregateFilter,
          'options': options
        }, function (error, result) {
          if (error) {
            return callback(error);
          }
          bookStore = result;
          return callback();
        });
      },
      'getAllBook': function (callback) {
        let data = bookStore;
        let query = {
          '$or': [ {
            'bprice': data.bprice
          }, {
            'bpagenum': data.bpagenum
          } ]
        };
        
        bookStoreModel.findAllByFilter({
          'filter': query
        }, function (error, result) {
          if (error) {
            return callback(error);
          }
          responseData.data = result;
          return callback();
        });
      }
    }, function (error) {
      if (error) {
        return next(error);
      }
      req.session.bookStore = responseData.data;
      return next();
    });
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};
