const AppError = require('./../utils/appError')

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/);
  const message = `Duplicate field value: ${value} please use another value`
  return new AppError(message, 400)
}

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}


const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data, ${errors.join('. ')}`
  return new AppError(message, 400);
}

const handleJwtError = () => new AppError('Invalid token. Please log in', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again', 401)

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')){
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  }) 
}
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')){

      // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  }
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
} 
  
      // Operational, trusted error: send message to client
      if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
          title: 'Something went wrong!',
          msg: err.message
        })
    
        // Programming or other unknown error: don't leak error details
      } 
        // 1) Log error
        console.error('ERROR 💥', err);
    
        // 2) Send generic message
        return res.status(err.statusCode).render('error', {
          title: 'Something went wrong!',
          msg: 'Please try again later.'
        })
}
module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production'){
      if(err.name === 'CastError') err = handleCastErrorDB(err);

      if(err.name === 11000) err = handleDuplicateFieldsDB(err);

      if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
      
      if (err.name === 'JsonWebTokenError') err = handleJwtError(err)
      
      if (err.name === 'TokenExpiredError') handleJWTExpiredError(err);
      
      sendErrorProd(err, req, res);
    }
    
    
  }