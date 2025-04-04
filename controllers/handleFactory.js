const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const APIFeature = require('./../utils/apiFeatures');


exports.deleteOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError(`No Document found with that ID`, 404))
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!doc) {
      return next(new AppError(`No Document found with that ID`, 404))
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions) 
  const doc = await query
  // doc.findOne({_id: req.params.id})
  if (!doc) {
    return next(new AppError(`No Document found with that ID`, 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getAll = Model => 
    catchAsync(async (req, res, next) => {
        // To allow for nested GET reviews on tour
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }

      // execute the query
      const feature = new APIFeature(Model.find(filter), req.query)
        .filter()
        .sort()
        .limit()
        .pagination();
      const docs = await feature.query;
      // Use .explain() for analyzing query
    
      // send res
      res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: docs.length,
        data: {
          docs,
        },
      });
    });
