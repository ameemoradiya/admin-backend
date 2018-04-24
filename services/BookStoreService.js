'use strict';

const _ = require('lodash');
const debug = require('debug')('Demo:BookStoreService');
const Boom = require('boom');
const bookStoreModel = require('../models/bookstore');

async function findBookByBookname (filter) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findOneByFilter({
      'filter': filter
    }, function (error, result) {
      if (error) {
        reject(error);
      }
      if (result) {
        reject(Boom.badRequest('Bookid or Bookname already inserted!'));
      }
      resolve();
    });
  });
}

async function addBook (newBook) {
  return new Promise((resolve, reject) => {
    bookStoreModel.insert({
      'newBook': newBook
    }, function (error, result) {
      if (error || !result) {
        reject(Boom.badRequest('Could not add book please try again!'));
      }
      resolve(result);
    });
  });
}
// add book
exports.bookSet = async function (req, res, next) {
  debug('Inside bookSet service.');

  try {
    let params = _.merge(req.body, req.query);
    let bookStore = {};
    let tempFilter = [];

    tempFilter.push({
      'bookId': params.bookId
    });
    tempFilter.push({
      'bname': {
        '$regex': new RegExp(`^' ${params.bname} $, i`)
      }
    });
    let filter = {
      '$or': tempFilter
    };

    await findBookByBookname(filter);

    let newBook = params;

    newBook.bookId = params.bookId;
    newBook.bname = params.bname;
    newBook.bdescription = params.bdescription;
    newBook.bpagenum = params.bpagenum;
    bookStore = await addBook(newBook);
    req.session.bookStore = bookStore;
    return next();
  } catch (error) {
    return next(error);
  }
};

// # getAllTasks
async function getAllBook (data) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findAllByFilter(data, function (error, result) {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  });
}
async function totalCount (searchQuery) {
  return new Promise((resolve, reject) => {
    bookStoreModel.countByFilter({
      'filter': searchQuery
    }, function (error, count) {
      if (error) {
        reject(error);
      }
      resolve(count);
    });
  });
}
exports.getAll = async function (req, res, next) {
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
        'bpagenum': {
          '$gt': params.showbypage
        }
      };
    }
    if (params.gpage && params.lpage) {
      searchQuery = {
        'bpagenum': {
          '$gt': params.gpage,
          '$lt': params.lpage
        }
      };
    }
    if (params.gpage && params.lpage && params.notequal) {
      searchQuery = {
        'bpagenum': {
          '$gt': params.gpage,
          '$lt': params.lpage,
          '$ne': params.notequal
        }
      };
    }
    if (params.showbyname) {
      searchQuery = {
        'bname': params.showbyname
      };
    }
    if (params.showbyid) {
      searchQuery = {
        'bookId': params.showbyid
      };
    }
    if (params.search) {
      searchQuery = {
        'bname': {
          '$regex': params.search
        }
      };
    }
    if (params.showbyyear) {
      searchQuery = {
        'breleasyear': params.showbyyear
      };
    }
    if (params.bpagesize === 0) {
      searchQuery = {
        'bpagenum': params.bpagesize
      };
    }
    if (params.yr1 && params.yr15) {
      searchQuery = {
        'breleasyear': {
          '$in': [ params.yr1, params.yr15 ]
        }
      };
    }
    if (params.bLanguage) {
      searchQuery = {
        'bLanguage': {
          '$ne': null
        }
      };
    }
    let data = {
      'filter': searchQuery,
      'limit': size || null,
      'skip': pageNo > 0 ? ((pageNo - 1) * size) : 0 || null,
      'sort': query.sort || null
    };

    responseData.data = await getAllBook(data);
    responseData.recordsTotal = await totalCount(searchQuery);
    req.session.bookStore = responseData;
    return next();
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
async function validateUpdateBook (filter) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findOneByFilter({
      'filter': filter
    }, function (error, result) {
      if (error) {
        reject(error);
      } else if (result) {
        reject(Boom.conflict('New book you are try to update is already exist!'));
      }
      resolve();
    });
  });
}
async function updateTaskById (data) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findOneAndUpdateByFilter(data,
      function (error, result) {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
  });
}
exports.updateBookById = async function (req, res, next) {
  debug('Inside updateBookById service.');
  let param = req.body;
  let updatedBook = {};

  try {
    if (!param) {
      return next(Boom.badRequest('Invalid Book!'), null);
    } else if (!param.bookId) {
      return next(Boom.badRequest('Invalid id!'), null);
    } else if (!param.bname) {
      return next(Boom.badRequest('Invalid book name!'), null);
    }
    let filter = {
      'bname': param.bname
    };

    await validateUpdateBook(filter);

    let params = param;
    let filters = {
      'bookId': param.bookId
    };
    let updatedData = {
      '$set': params
    };
    let options = {
      'new': true,
      'runValidators': true
    };
    let data = {
      'filter': filters,
      'updatedData': updatedData,
      'options': options
    };

    updatedBook = await updateTaskById(data);
    req.session.bookStore = updatedBook;
    return next();
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
    let filters = {
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
      'filter': filters,
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
    let filters = {
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
      'filter': filters,
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
async function filterData (data) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findAllByAggregate(data, function (error, result) {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  });
}
async function getallBook (query) {
  return new Promise((resolve, reject) => {
    bookStoreModel.findAllByFilter({
      'filter': query
    }, function (error, result) {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  });
}

exports.getFilterByPricePages = async function (req, res, next) {
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
    let data = {
      'aggregateFilter': aggregateFilter,
      'options': options
    };

    bookStore = await filterData(data);

    let book = bookStore;
    let query = {
      '$or': [ {
        'bprice': book.bprice
      }, {
        'bpagenum': book.bpagenum
      } ]
    };

    responseData.data = await getallBook(query);
    req.session.bookStore = responseData.data;
    return next();
  } catch (error) {
    debug('error :%o ', error);
    return next(error);
  }
};
