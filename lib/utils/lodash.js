'use strict';

let _ = require('lodash');

_.mixin({
  'compactObject': function (o) {
    _.each(o, function (v, k) {
      if (v === null || v === undefined || v === 'null') {
        delete o[k];
      }
    });
    return o;
  },
  'removeEmptyKey': function (o) {
    _.each(o, function (v, k) {
      if (v === undefined || v === '') {
        delete o[k];
      }
    });
    return o;
  }
});
