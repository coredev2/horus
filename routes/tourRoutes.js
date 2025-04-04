const express = require('express')
const { getAllTours, getTour, createTour, updateTour, deleteTour, aliasTopTour, getTourStats, getMonthlyPlan, getToursWithin, getDistances, uploadTourImages, resizeTourImages } = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router();
// router.param('id', checkID);
// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// GET /tour/234fad4/reviews/g4baa42


// router.route('/:tourId/reviews').post(authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// )

router.use('/:tourId/reviews', reviewRouter)

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTour, getAllTours)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get( getToursWithin)

router.route('/distances/:latlng/unit/:unit').get(getDistances)

router.route('/').get( getAllTours).post( authController.protect, authController.restrictTo('admin', 'lead-guide'), createTour);
router.route('/:id').get(getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);





module.exports = router;

