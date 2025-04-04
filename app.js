const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const compression = require('compression')



const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController')
const viewRouter = require('./routes/viewRoutes')

const app = express();

app.set('trust proxy', 1)

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


// Middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Security HTTP Headers
// app.use(helmet())

app.use(cors());

app.use(compression())

// Dev Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
  validate: {trustProxy: false}
})


app.use('/api', limiter)

app.post('/webhook-checkout', express.raw({ type: 'application/json'}), bookingController.webhookCheckout)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())

// Data sanitizzation against noSQL query injection
app.use(mongoSanitize());

// Data sanitization againt XSS 
app.use(xss());

// Pervent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))






// Testing middlewre
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Routes
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);




app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  
})


app.use(globalErrorHandler);


module.exports = app;
