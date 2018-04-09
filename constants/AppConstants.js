'use strict';
var ROOT_PATH = process.cwd();

exports.TABLES = {
    TASK: 'Task',
    BOOK: 'books',
    USERS: 'users'
};

exports.JWT = {
    KEY: 'asdfghjkl1234567890',
    ALGORITHMS: 'HS512'
};

exports.GOOGLECAPTCHA = {
    SECRET: '6LepJioTAAAAAJAI_x6TevQblEDQW6Bk172MTxCT',
    URl: 'https://www.google.com/recaptcha/api/siteverify'
};

exports.TABLESETTING = {
    LIMIT: 10,
    SKIP: 0,
};

exports.EMAIL_TEMPLATE = ROOT_PATH + '/constants/template/email/';

exports.STRING = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';