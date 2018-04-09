const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const request = require('request');

const debug = require('debug')('Javandi:UserService');
const Boom = require('boom');
const fs = require('fs');
const juice = require('juice');
const md5 = require('md5');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const open = require('open');

const userModel = require('../models/user');
const APP_CONSTANTS = require('../constants/AppConstants');
var CONFIG_CONSTANTS = require('../constants/ConfigConstants');

exports.validateRegister = function (req, res, next) {
    debug('Inside validateRegister service.');
    try {
        let params = _.merge(req.body, req.query);

        if (!params) {
            return next(new Boom.badRequest('Invalid user!'));
        } else if (!params.username) {
            return next(new Boom.badRequest('Invalid username!'));
        } else if (!params.email) {
            return next(new Boom.badRequest('Invalid email!'));
        } else if (!params.password) {
            return next(new Boom.badRequest('Invalid password!'));
        } else if (!params.gRecaptchaResponse) {
            return next(new Boom.badRequest('Please resolve the captcha before submit!'));
        } else if (params.refferals && _.size(params.refferals) > 0 && !_.isUndefined(params.refferals[0].affid) && !mongoose.Types.ObjectId.isValid(params.refferals[0].affid)) {
            return next(new Boom.badRequest('Invalid referral!'));
        }
        return next();
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.verifyRegistrationCaptcha = function (req, res, next) {
    debug('Inside verifyRegistrationCaptcha service.');
    try {
        let params = _.merge(req.body, req.query);

        request.post(APP_CONSTANTS.GOOGLECAPTCHA.URl, {
            form: {
                secret: APP_CONSTANTS.GOOGLECAPTCHA.SECRET,
                response: params.gRecaptchaResponse
            }

        }, function (error, response) {
            if (error) {
                return next(error);
            }
            let captchaResult = JSON.parse(response.body);
            if (captchaResult.success !== true) {
                return next(new Boom.badRequest('Please resolve the captcha before submit!'));
            } else {
                return next();
            }
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
}

exports.findUserByUsername = function (req, res, next) {
    debug('Inside findUserByUsername service.');
    try {
        let params = _.merge(req.body, req.query);

        let tempFilter = [];
        tempFilter.push({
            username: {
                $regex: new RegExp("^" + params.username + "$", "i")
            }
        });
        tempFilter.push({
            email: {
                $regex: new RegExp("^" + params.email + "$", "i")
            }
        });

        let filter = {
            $or: tempFilter
        };

        userModel.findOneByFilter({
            filter: filter
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            if (result) {
                return next(new Boom.badRequest('Username or email already registered!'));
            }
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.generateTokenForUser = function (req, res, next) {
    debug('Inside generateTokenForUser service.');
    try {

        let params = _.merge(req.body, req.query);

        jwt.sign({
            u: params.username,
            t: params.type || '1'
        }, APP_CONSTANTS.JWT.KEY, {
            algorithm: APP_CONSTANTS.JWT.ALGORITHMS,
            noTimestamp: true,
        }, function (err, token) {
            params.token = token;
            return next();
        });


    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.register = function (req, res, next) {
    debug('Inside register service.');
    try {
        let params = _.merge(req.body, req.query);
        let userStore = {};

        nodemailer.createTestAccount((err, account) => {

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass // generated ethereal password
                }
            });

            const text = 'Welcome' + params.username;
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Fred Foo 👻" <no-reply@pangalink.net>', // sender address
                to: params.email, // list of receivers
                subject: 'Hello ✔', // Subject line
                text: text, // plain text body
                // html: `<b>${text}</b>` // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }

                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                open(nodemailer.getTestMessageUrl(info), function (err) {
                    if (err) throw err;
                });
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });


        if (!params.token) {
            return next(new Boom.badRequest('Could not completed registration please try again!'), null);
        }

        let newUser = params;
        newUser.password_clear = params.password;
        newUser.type = params.type || '1';
        newUser.status = params.status || false;
        newUser.fullname = params.username;

        userModel.insert({
            newUser: newUser
        }, function (error, result) {
            if (error || !result) {
                let validationErrors = '';
                Object.keys(error.errors).forEach(function (key) {
                    validationErrors += error.errors[key].message + '<br />';
                });
                if (validationErrors === '') {
                    validationErrors = 'Could not completed registration please try again!';
                }
                return next(new Boom.badRequest(validationErrors));
            }
            req.session.userStore = result;
            return next();
        });


    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.validateLogIn = function (req, res, next) {
    debug('Inside validateLogIn service.');
    try {
        let params = req.body;

        if (!params) {
            return next(new Boom.badRequest('Invalid data!'), null);
        } else if (!params.username) {
            return next(new Boom.badRequest('Invalid username!'), null);
        } else if (!params.password) {
            return next(new Boom.badRequest('Invalid password!'), null);
        } else {
            return next();
        }

    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.findUser = function (req, res, next) {
    debug('Inside findUser service.');
    try {
        let params = req.body;
        let filter = {
            password: md5(params.password),
            type: 1,
            status: true
        };

        if (params.username.indexOf('@') > 0) {
            filter.email = {
                $regex: new RegExp("^" + params.username + "$", "i")
            };
        } else {
            filter.username = {
                $regex: new RegExp("^" + params.username + "$", "i")
            };
        }
        userModel.findOneByFilter({
            filter: filter
        }, function (error, result) {
            if (error || !result) {
                //debug('error', result);
                return next(new Boom.badRequest('User not found or not activated yet!'), null);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }

}

exports.generateTokenForFoundUser = function (req, res, next) {
    debug('Inside generateTokenForFoundUser service.');
    try {
        let params = req.body;
        let userStore = req.session.userStore;
        jwt.sign({
            u: userStore.username,
            t: userStore.type
        }, APP_CONSTANTS.JWT.KEY, {
            algorithm: APP_CONSTANTS.JWT.ALGORITHMS,
            noTimestamp: true
        }, function (err, token) {
            userStore.token = token;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};
exports.logIn = function (req, res, next) {
    debug('Inside logIn service.');
    try {
        let params = req.body;
        let userStore = req.session.userStore;

        if (!userStore.token) {
            return next(new Boom.badRequest('Could not log In please try again or contact administrator!'), null);
        }

        let filter = {
            _id: userStore._id
        };

        let updatedData = {
            $set: {
                token: userStore.token
            }
        };
        let options = {
            new: true,
            runValidators: true
        };

        userModel.findOneAndUpdateByFilter({
            filter: filter,
            updatedData: updatedData,
            options: options
        }, function (error, result) {
            if (error || !result) {
                return next(new Boom.badRequest('Could not log In please try again or contact administrator!'), null);
            }

            req.session.userStore = result;
            return next();
        });


    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.getCurrentUser = function (req, res, next) {
    debug('Inside getCurrentUser service.');
    try {
        let userStore = req.body.decoded_user;
        if (!userStore) {
            return next(new Boom.badRequest('User not found!'));
        }

        let filter = {
            _id: userStore._id
        };
        userModel.findOneByFilter({
            filter: filter
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            userStore.fullname = result.fullname;
            userStore.email = result.email;
            req.session.userStore = userStore;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.updateUser = function (req, res, next) {
    debug('Inside updateUser service.');
    try {

        let params = req.body;
        if (!params) {
            return next(new Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(new Boom.badRequest('Invalid id!'), null);
        }

        let regExp = /^[A-Za-z0-9]{32}$/;
        if (params.newPassword && !params.newPassword.match(regExp) && (params.newPassword.length < 8 || params.newPassword.length > 20)) {
            return next(new Boom.badRequest('The Password should be between 8 and 20 characters!'), null);
        }
        let newPassword = '';
        if (params.newPassword) {
            newPassword = md5(params.newPassword);
        }

        let set = {
            fullname: params.fullname,
            username: params.username,
            moreInfo: params.moreInfo,
            email: params.email,
            password: params.password,
        };

        if (newPassword) {
            set.password = newPassword;
            set.password_clear = params.newPassword;
        }

        let filter = {
            _id: mongoose.Types.ObjectId(params._id),
            token: req.headers.authorization,
            type: '1'
        };
        let updatedData = {
            $set: _.compactObject(set)
        };
        let options = {
            new: true,
            runValidators: true
        };

        userModel.findOneAndUpdateByFilter({
            filter: filter,
            updatedData: updatedData,
            options: options
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error :%o ', error);
        return next(error);
    }
};

exports.findOneUser = function (req, res, next) {
    debug('Inside findOneUser service.');
    var params = req.body;
    try {
        if (!params) {
            return next(new Boom.badRequest('Invalid user!'), null);
        } else if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
            return next(new Boom.badRequest('Invalid id!'), null);
        }

        var filter = {
            _id: mongoose.Types.ObjectId(params.id),
            token: req.headers.authorization,
            type: '1'
        };

        userModel.findOneByFilter({
            filter: filter
        }, function (error, result) {
            if (error) {
                return next(error);
            }

            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

let newPassword = '';
exports.findUserByEmail = function (req, res, next) {
    debug('Inside findUserByEmail service.');
    try {
        let params = req.body;
        if (!params.usermail) {
            return next(new Boom.badRequest('Invalid email!'));
        }
        let filter = {
            email: params.usermail
        };
        userModel.findOneByFilter({
            filter: filter
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        return next(error);
    }

};

exports.sendEmail = function (req, res, next) {
    debug('Inside resetUserPassword service.');
    try {
        var params = req.body;
        if (!params.usermail) {
            return next(new Boom.badRequest('Invalid email!'));
        }
        let userStore = req.session.userStore;

        if (!userStore) {
            return next(new Boom.badRequest('Invalid email!'));
        }

        newPassword = _.join(_.sampleSize(_.shuffle(_.split(APP_CONSTANTS.STRING, '')), 10), '');

        fs.readFile(APP_CONSTANTS.EMAIL_TEMPLATE + 'resetPassword.html', 'utf8', function (error, fileData) {

            if (error) {
                return next(new Boom.notFound('Unable to reset password!'));
            }

            var compiledTemplate = _.template(fileData);
            var emailData = {
                fullname: userStore.fullname,
                newPassword: newPassword,
                logoUrl: CONFIG_CONSTANTS.CONFIG.uiUrl + '/assets/logo_javandi_black.png'
            };
            compiledTemplate = compiledTemplate(emailData);
            var htmlData = juice(compiledTemplate);
            nodemailer.createTestAccount((err, account) => {
                let transporter = nodemailer.createTransport({
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure, // true for 465, false for other ports
                    auth: {
                        user: account.user, // generated ethereal user
                        pass: account.pass // generated ethereal password
                    }
                });
                var mailOptions = {
                    from: 'sender@server.com',
                    to: userStore.email,
                    subject: 'Your password has been changed',
                    html: htmlData
                };
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    open(nodemailer.getTestMessageUrl(info), function (err) {
                        if (err) throw err;
                    });
                });
            });
        });
    } catch (error) {
        return next(error);
    }
};

exports.resetUserPassword = function (req, res, next) {
    debug('Inside resetUserPassword service.');

    try {
        const params = req.body;
        if (!params.usermail) {
            return next(new Boom.badRequest('Invalid email!'));
        }
        let userStore = req.session.userStore;
        
        let filter = {
            _id: mongoose.Types.ObjectId(userStore._id)
        };

        let updatedData = {
            $set: {
                password_clear: newPassword,
                password: md5(newPassword)
            }
        };
        let options = {
            new: true,
            runValidators: true
        };

        userModel.findOneAndUpdateByFilter({
            filter: filter,
            updatedData: updatedData,
            options: options
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        return next(error);
    }

};

exports.updateUserByadmn = function (req, res, next) {
    debug('Inside updateUser service.');

    try {
        const params = req.body;
        if (!params) {
            return next(new Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(new Boom.badRequest('Invalid id!'), null);
        }

        let regExp = /^[A-Za-z0-9]{32}$/;
        if (params.newPassword && !params.newPassword.match(regExp) && (params.newPassword.length < 8 || params.newPassword.length > 20)) {
            return next(new Boom.badRequest('The Password should be between 8 and 20 characters!'), null);
        }
        let newPassword = '';
        if (params.newPassword) {
            newPassword = md5(params.newPassword);
        }

        var set = {
            fullname: params.fullname,
            username: params.username,
            company: params.company,
            address: params.address,
            city: params.city,
            zip: params.zip,
            country: params.country,
            phone: params.phone,
            moreInfo: params.moreInfo,
            email: params.email,
            emailRetype: params.emailRetype,
            password: params.password,
            password_clear: params.password_clear,
            status: params.status
        };

        if (newPassword) {
            set.password = newPassword;
            set.password_clear = params.newPassword;
        }

        var filter = {
            _id: mongoose.Types.ObjectId(params._id)
        };
        var updatedData = {
            $set: _.compactObject(set)
        };
        var options = {
            new: true,
            runValidators: true
        };

        userModel.findOneAndUpdateByFilter({
            filter: filter,
            updatedData: updatedData,
            options: options
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        return next(error);
    }
};

exports.getAllForAffiliatesTable = function (req, res, next) {
    debug('Inside getAllForAffiliatesTable service.');
    var responseData = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
    };
    try {
        var params = req.body;

        var searchQuery = {
            'type': '1'
        };
        let pageNo = parseInt(params.pagenumber);
        let size = parseInt(params.perpage);
        var queryFilter = {
            limit: APP_CONSTANTS.TABLESETTING.LIMIT,
            offset: pageNo > 0 ? ((pageNo - 1) * size) : 0
        };

        let query = {};
        let sortCol = params.sortColumn;
        let sortType = params.sortType;
        let skip = pageNo > 0 ? ((pageNo - 1) * size) : 0;
        query.sort = {};
        query.sort[sortCol] = sortType;

        if (params) {
            if (params.limit) {
                queryFilter.limit = params.limit;
            }
            if (params.offset) {
                queryFilter.offset = params.offset;
            }


            if (params.search) {
                var queryTemp = [];
                queryTemp.push({
                    username: {
                        $regex: ".*" + params.search + ".*",
                        $options: '-i'
                    }
                });
                queryTemp.push({
                    fullname: {
                        $regex: ".*" + params.search + ".*",
                        $options: '-i'
                    }
                });
                queryTemp.push({
                    email: {
                        $regex: ".*" + params.search + ".*",
                        $options: '-i'
                    }
                });

                //Search by _id
                if (mongoose.Types.ObjectId.isValid(params.search)) {
                    queryTemp.push({
                        '_id': params.search
                    });
                }

                searchQuery['$or'] = queryTemp;
            }



        }

        //Database query
        async.series({
            findUsers: function (innerCallback) {

                var select = {
                    password: 0,
                    passwordRetype: 0
                };
                userModel.findAllByFilter({
                    filter: searchQuery,
                    limit: queryFilter.limit,
                    skip: queryFilter.offset,
                    sort: query.sort,
                    select: select
                }, function (error, result) {
                    if (error) {
                        return innerCallback(error);
                    }
                    result.forEach(function (item, index, object) {
                        if (item.username === 'admin') {
                            object.splice(index, 1);
                        }
                    });
                    responseData.data = result;
                    return innerCallback();
                });

            },

            filterRecordCount: function (innerCallback) {

                userModel.countByFilter({
                    filter: query
                }, function (error, count) {
                    if (error) {
                        return innerCallback(error);
                    }
                    responseData.recordsFiltered = count - 1;
                    return innerCallback();
                });

            },

            totalRecordCount: function (innerCallback) {

                var filter = {
                    type: '1'
                };
                userModel.countByFilter({
                    filter: filter
                }, function (error, count) {
                    if (error) {
                        return innerCallback(error);
                    }
                    responseData.recordsTotal = count - 1;
                    return innerCallback();
                });

            }
        }, function (error) {
            if (error) {
                return next(error);
            }
            req.session.userStore = responseData;
            return next();
        });
    } catch (error) {
        return next(error);
    }
};

//# deleteUser
exports.deleteUserByadmn = function (req, res, next) {
    try {
        let params = _.merge(req.params, req.body);

        if (!params) {
            return next(new Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(new Boom.badRequest('Invalid id!'), null);
        }
        userModel.deleteById({
            id: params._id
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        return next(error);
    }
};