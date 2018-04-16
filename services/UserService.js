const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const request = require('request');
const debug = require('debug')('Demo:UserService');
const Boom = require('boom');
const fs = require('fs');
const juice = require('juice');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const userModel = require('../models/user');
const APP_CONSTANTS = require('../constants/AppConstants');
const CONFIG_CONSTANTS = require('../constants/ConfigConstants');

exports.validateRegister = function (req, res, next) {
    debug('Inside validateRegister service.');
    try {
        let params = _.merge(req.body, req.query);

        if (!params) {
            return next(Boom.badRequest('Invalid user!'));
        } else if (!params.username) {
            return next(Boom.badRequest('Invalid username!'));
        } else if (!params.email) {
            return next(Boom.badRequest('Invalid email!'));
        } else if (!params.password) {
            return next(Boom.badRequest('Invalid password!'));
        } else if (!params.gRecaptchaResponse) {
            return next(Boom.badRequest('Please resolve the captcha before submit!'));
        } else if (params.refferals && _.size(params.refferals) > 0 && params.refferals[0].affid && !mongoose.Types.ObjectId.isValid(params.refferals[0].affid)) {
            return next(Boom.badRequest('Invalid referral!'));
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
                return next(Boom.badRequest('Please resolve the captcha before submit!'));
            } else {
                return next();
            }
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
}

exports.findUserByName = function (req, res, next) {
    debug('Inside findUserByName service.');
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
                return next(Boom.badRequest('Username or email already registered!'));
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
        let newUser = params;
        newUser.password_clear = params.password;
        newUser.type = params.type || '1';
        newUser.status = params.status || false;
        newUser.fullname = params.username;
        newUser.uploadImgName = params.uploadImgName || '';

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
                return next(Boom.badRequest(validationErrors));
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }
};

exports.sendEmailUserReg = function (req, res, next) {
    try{
        let params = _.merge(req.body, req.query);
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'am.moradiya01@gmail.com',
                pass: 'password@password'
            }
        });

        const html = `<h5>Hey ${params.username}!</h5>
        <p>Your account has been registered.</p>
        <table class="social" style="border-top:1px solid #bebebe">
        </br>
        <tr>
            <td>Your Login credentials are:</td>
            </tr>
            <tr>
            <td>Username: ${params.username}</td>
            </tr>
            <tr>
            <td>Password: ${params.password}</td>
            </tr>
            </table>`;
            // setup email data with unicode symbols
            let mailOptions = {
                from: 'am.moradiya01@gmail.com', // sender address
                to: params.email,
                subject: 'User Registered',
                html: html
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return next(error);
                }
                debug('Preview URL: %s', info.response);
                return next();
            });
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
            return next(Boom.badRequest('Invalid data!'), null);
        } else if (!params.username) {
            return next(Boom.badRequest('Invalid username!'), null);
        } else if (!params.password) {
            return next(Boom.badRequest('Invalid password!'), null);
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
                return next(Boom.badRequest('User not found or not activated yet!'), null);
            }
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error %o', error.stack);
        return next(error);
    }

}

exports.generateTokenUser = function (req, res, next) {
    debug('Inside generateTokenUser service.');
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
            return next(Boom.badRequest('Could not log In please try again or contact administrator!'), null);
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
                return next(Boom.badRequest('Could not log In please try again or contact administrator!'), null);
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
            return next(Boom.badRequest('User not found!'));
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
            return next(Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(Boom.badRequest('Invalid id!'), null);
        }

        let regExp = /^[A-Za-z0-9]{32}$/;
        if (params.newPassword && !params.newPassword.match(regExp) && (params.newPassword.length < 8 || params.newPassword.length > 20)) {
            return next(Boom.badRequest('The Password should be between 8 and 20 characters!'), null);
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
            phone: params.phone,
            address: params.address,
            city: params.city,
            zip: params.zip
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

exports.sendEmailProfileUpdate = function (req, res, next){
    try {
        let params = req.body;
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
            auth: {
                user: 'am.moradiya01@gmail.com',
                pass: 'password@password'
            }
        });

        const html = `<h2>Dear ${params.username}</h2> <p>Your account details and/or user profile has been altered on our website. The administrators have chosen to notify users of certain changes to their accounts. If you did not make these changes, please contact us immediately.</p>`;
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Fred Foo 👻" <no-reply@pangalink.net>',
            to: params.email,
            subject: 'Profile Change',
            html: html
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return next(error);
            }
            Debug('Preview URL: %s', info.response);
        });
    });
} catch (error) {
    debug('error %o', error.stack);
    return next(error);
}
}

exports.findOneUser = function (req, res, next) {
    debug('Inside findOneUser service.');
    var params = req.body;
    try {
        if (!params) {
            return next(Boom.badRequest('Invalid user!'), null);
        } else if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
            return next(Boom.badRequest('Invalid id!'), null);
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
            return next(Boom.badRequest('Invalid email!'));
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

exports.resetUserPassword = function (req, res, next) {
    debug('Inside resetUserPassword service.');

    try {
        var params = req.body;
        let userStore = req.session.userStore;

        if (!userStore) {
            return next(Boom.badRequest('Invalid email!'));
        }

        newPassword = _.join(_.sampleSize(_.shuffle(_.split(APP_CONSTANTS.STRING, '')), 10), '');

        if (!params.usermail) {
            return next(Boom.badRequest('Invalid email!'));
        }

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

exports.sendEmailReserPass = function (req, res, next) {
    debug('Inside sendEmail service.');
    try {
        var params = req.body;
        if (!params.usermail) {
            return next(Boom.badRequest('Invalid email!'));
        }
        let userStore = req.session.userStore;

        if (!userStore) {
            return next(Boom.badRequest('Invalid email!'));
        }

        fs.readFile(APP_CONSTANTS.EMAIL_TEMPLATE + 'resetPassword.html', 'utf8', function (error, fileData) {

            if (error) {
                return next(Boom.notFound('Unable to reset password!'));
            }

            var compiledTemplate = _.template(fileData);
            var emailData = {
                fullname: userStore.fullname,
                newPassword: newPassword,
                logoUrl: CONFIG_CONSTANTS.CONFIG.uiUrl + '/test-img.png'
            };
            compiledTemplate = compiledTemplate(emailData);
            var htmlData = juice(compiledTemplate);
            nodemailer.createTestAccount((err, account) => {
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'am.moradiya01@gmail.com',
                        pass: 'password@password'
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
                        return next(err);
                    }
                    debug('Preview URL: %s', info.response);
                    return next();
                });
            });
        });
    } catch (error) {
        return next(error);
    }
};

exports.updateUserByadmn = function (req, res, next) {
    debug('Inside updateUserByadmn service.');

    try {
        const params = req.body;
        if (!params) {
            return next(Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(Boom.badRequest('Invalid id!'), null);
        }

        let regExp = /^[A-Za-z0-9]{32}$/;
        if (params.newPassword && !params.newPassword.match(regExp) && (params.newPassword.length < 8 || params.newPassword.length > 20)) {
            return next(Boom.badRequest('The Password should be between 8 and 20 characters!'), null);
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
    debug('Inside deleteUserByadmn service.');
    try {
        let params = _.merge(req.params, req.body);

        if (!params) {
            return next(Boom.badRequest('Invalid user!'), null);
        } else if (!params._id || !mongoose.Types.ObjectId.isValid(params._id)) {
            return next(Boom.badRequest('Invalid id!'), null);
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

exports.validateAddProPhoto = function (req, res, next) {
    debug('Inside validateAddProPhoto service.');
    const params = req.body;
    if (!params) {
        return next(Boom.badRequest('Invalid image!'), null);
    } else if (!params.uploadImgTitle) {
        return next(Boom.badRequest('Invalid title!'));
    } else if (!req.file) {
        return next(Boom.badRequest('Invalid image!'));
    }
    return next();

};

exports.addProfilePhoto = function (req, res, next) {
    debug('Inside addProfilePhoto service.');
    try {
        let params = req.body;
        var newImage = params;
        newImage.uploadImgBy = params.decoded_user.username;
        newImage.uploadImgName = req.file.filename;


        if (!params) {
            return next(Boom.badRequest('Invalid user!'), null);
        } else if (!params.decoded_user._id || !mongoose.Types.ObjectId.isValid(params.decoded_user._id)) {
            return next(Boom.badRequest('Invalid id!'), null);
        }

        let set = {
            uploadImgName: req.file.filename
        };

        let filter = {
            _id: mongoose.Types.ObjectId(params.decoded_user._id),
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
        async.series({
            addImage: function (callback) {

                var newImage = params;
                newImage.uploadImgBy = params.decoded_user.username;
                newImage.uploadImgName = req.file.filename;

                userModel.findOneAndUpdateByFilter({
                    filter: filter,
                    updatedData: updatedData,
                    options: options
                }, function (error, result) {
                    if (error) {
                        return callback(error);
                    }

                    if (params.froala && params.froala == 'true') {
                        imageStore = {
                            link: 'https://s3-eu-central-1.amazonaws.com/igamingcloudstr/images/' + req.file.filename
                        };
                        return callback();
                    } else {
                        imageStore = result;
                        return callback();
                    }
                });

            },
            uploadImageToAmazonDirectory: function (callback) {
                fs.createReadStream(APP_CONSTANTS.IMAGES_PATH.IMAGES + req.file.filename);
                return callback();
            }

        }, function (error) {
            if (error) {
                return next(error);
            }
            req.session.userStore = imageStore;
            return next();
        });


    } catch (error) {
        debug('error :%o ', error);
        return next(error);
    }
};

exports.deleteProfilePhoto = function (req, res, next) {
    debug('Inside deleteProfilePhoto service.');
    try {

        let filter = {
            _id: req.params.id
        };
    
        let set = {
            uploadImgName: '',
        };
        userModel.findOneAndUpdateByFilter({
            filter: filter,
            updatedData: set
        }, function (error, result) {
            if (error) {
                return next(error);
            }
            let imageName = result.uploadImgName.slice(0, 25);
            console.log('imageName', imageName);
            fs.unlink(APP_CONSTANTS.IMAGES_PATH.IMAGES + imageName);
            req.session.userStore = result;
            return next();
        });
    } catch (error) {
        debug('error :%o ', error);
        return next(error);
    }
};