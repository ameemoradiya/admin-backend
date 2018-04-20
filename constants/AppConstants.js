'use strict';

let ROOT_PATH = process.cwd();

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

exports.IMAGES_PATH = {
    IMAGES: ROOT_PATH + '/public/assets/profilePhotos/'
};

exports.EMAIL_TEMPLATE = ROOT_PATH + '/constants/template/email/';
exports.SEND_EMAIL = {
    EMAIL: 'am.moradiya01@gmail.com',
    PASS: 'password@password'
};

exports.STRING = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
