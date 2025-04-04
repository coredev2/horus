const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Email = require('./../utils/email')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto' === 'https']
    }


    res.cookie('jwt', token, cookieOptions)
    
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req,res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
    })
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome()
    
    createSendToken(newUser, 201, req, res);
})


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
    }
    // 2) Check if user exists && password is correct 
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) if everything ok, send token to client
    createSendToken(user, 200, req, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success'})
}

exports.protect = catchAsync(async (req,res,next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) token = req.cookies.jwt;

    if(!token) {
        return next(new AppError('You are not logged in!!! Please log in to get access', 401))
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // 3) Check if user still exists

    const freshUser = await User.findById(decoded.id)
    if(!freshUser) return next(new AppError('The user of this token does no longer exist.', 401))

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401))
    }

    req.user = freshUser;
    res.locals.user = freshUser
    next()
})

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try{
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
    // 3) Check if user still exists

    const freshUser = await User.findById(decoded.id)
    if(!freshUser) return next();

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next()
    }

    res.locals.user = freshUser
    return next()
} catch (err) {
    return next();
}
}
next();
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
const user = await User.findOne({ email: req.body.email })

if(!user) {
    return next(new AppError('There is no user with this email address', 404))
}

const resetToken = user.createPasswordResetToken();
await user.save({validateBeforeSave: false});

try {
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
await new Email(user, resetURL).sendPasswordReset()

res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
})} catch(err) {
    user.passwordResetToken = undefined 
    user.passwordResetExpired = undefined 
    await user.save({validateBeforeSave: false});

    return next(new AppError('There was an error sending the email. Please try again later', 500))
}
})

exports.resetPassword = catchAsync(async (req, res, next) => {
// 1) Get user based on the token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
const user = await User.findOne({ passwordResetToken: hashedToken });
if(!user) {
    return next(new AppError('This token does not exist anymore. Please try to reset your password again'))
}

// 2) if token has not expired and there is user, set the new password
const expirationDate = new Date(user.passwordResetExpires)
if (!expirationDate.getTime() > Date.now()){
    return next(new AppError('This token has expired. Please try reseting your password again'))
}

user.password = req.body.password
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

// 4) Log the user in, send JWT
createSendToken(user, 200, req, res);
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id)
    const pass = await User.findById(req.user.id).select('password ').lean();
    // 2) Check if current password is correct
    // 3) if so, update password
    if(!(await user.correctPassword(req.body.currentPassword, pass.password))) return next(new AppError('Password is not correct', 401))
    
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm

    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
})